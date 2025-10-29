/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists

const { getApiResponse } = require("../configs/axios.config");
const apiConfig = require("../configs/api.config");
const { calculateOffset } = require("../utils");

/**
 * Get Spotify catalog information for several artists based on their Spotify IDs
 * @param {Object} req - Express request object
 * @param {string} artistIds - Comma-separated artist IDs
 * @returns {Promise<Object>}
 */
async function getSeveralArtistsInfo(req, artistIds) {
  try {
    if (!artistIds || artistIds.trim() === "") {
      console.log("No artist IDs provided, returning empty result");

      return { artists: [] };
    }

    const artistIdArray = artistIds.split(",").filter((id) => id.trim() !== "");

    if (artistIdArray.length === 0) {
      return { artists: [] };
    }

    // Spotify API max: 50
    const limitedArtistIds = artistIdArray.slice(0, 50).join(",");
    const { data: severalArtistsInfo } = await getApiResponse(
      `/artists?ids=${limitedArtistIds}`,
      req.cookies.access_token
    );
    const validArtists = severalArtistsInfo.artists.filter(
      (artist) => artist !== null
    );

    return {
      ...severalArtistsInfo,
      artists: validArtists,
    };
  } catch (error) {
    console.error("Error fetching artists info:", error.message);

    return { artists: [] };
  }
}

/**
 * Get albums of a Spotify artist
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of playlists to return. Default is 28.
 * @param {string} [id] - The Spotify ID of an artist (fallback if not in `req.params`)
 * @returns {Promise<Object>}
 */
async function getArtistAlbums(
  req,
  itemLimit = apiConfig.DEFAULT_LIMIT,
  id = undefined
) {
  const offset = calculateOffset(req.params, itemLimit);
  const { artistId = id } = req.params;
  const { data: artistAlbums } = await getApiResponse(
    `/artists/${artistId}/albums?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/${artistId}/albums`,
    page: req.params.page ?? 1,
    ...artistAlbums,
  };
}

/**
 * Get Spotify catalog information for a single artist identified by their unique Spotify ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function getArtistInfo(req) {
  const { artistId } = req.params;
  const { data: artistInfo } = await getApiResponse(
    `/artists/${artistId}`,
    req.cookies.access_token
  );

  return artistInfo;
}

/**
 * Get Spotify catalog information about an artist's top tracks by country
 * @param {Object} req - Express request object
 * @param {string} [id] - The Spotify ID of an artist (fallback if not in `req.params`)
 * @returns {Promise<Object>}
 */
async function getArtistTopTracks(req, id = undefined) {
  const { artistId = id } = req.params;
  const { data: artistTopTracks } = await getApiResponse(
    `/artists/${artistId}/top-tracks?market=${apiConfig.MARKET}`,
    req.cookies.access_token
  );

  return artistTopTracks;
}

/**
 * Get related artists using genre-based search and artist analysis
 * @param {Object} req - Express request object
 * @param {string} [id] - The Spotify ID of an artist (fallback if not in `req.params`)
 * @returns {Promise<Object>} Object containing array of related artists
 */
async function getRelatedArtists(req, id = undefined) {
  try {
    const { artistId = id } = req.params;
    const maxLimit = 20;

    // Step 1: Get the target artist's information (genres are key)
    const { data: artistInfo } = await getApiResponse(
      `/artists/${artistId}`,
      req.cookies.access_token
    );

    const targetGenres = artistInfo.genres || [];
    const relatedArtistsMap = new Map(); // using Map to avoid duplicates

    // exclude the original artist
    const excludeArtistId = artistId;

    // Step 2: Search by each genre to find artists in similar genres
    if (targetGenres.length > 0) {
      // limit to top 3 genres to avoid too many API calls
      const topGenres = targetGenres.slice(0, 3);

      for (const genre of topGenres) {
        try {
          const searchQuery = `genre:"${genre}"`;
          const { data: searchResults } = await getApiResponse(
            `/search?q=${encodeURIComponent(
              searchQuery
            )}&type=artist&limit=10&market=${apiConfig.MARKET}`,
            req.cookies.access_token
          );

          if (searchResults.artists && searchResults.artists.items) {
            searchResults.artists.items.forEach((artist) => {
              if (
                artist &&
                artist.id &&
                artist.id !== excludeArtistId &&
                !relatedArtistsMap.has(artist.id)
              ) {
                // Calculate genre match score
                const genreMatchCount =
                  artist.genres?.filter((g) => targetGenres.includes(g))
                    .length || 0;

                relatedArtistsMap.set(artist.id, {
                  ...artist,
                  genreMatchScore: genreMatchCount,
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error searching for genre "${genre}":`, error.message);
        }

        // Early exit if we have enough artists
        if (relatedArtistsMap.size > maxLimit) break;
      }
    }

    // Step 3: Get artist's top tracks to find featured/collaboration artists
    try {
      const { data: topTracksData } = await getApiResponse(
        `/artists/${artistId}/top-tracks?market=${apiConfig.MARKET}`,
        req.cookies.access_token
      );

      if (topTracksData.tracks) {
        topTracksData.tracks.forEach((track) => {
          if (track.artists && track.artists.length > 1) {
            // Find collaborating artists
            track.artists.forEach((artist) => {
              if (
                artist.id !== excludeArtistId &&
                !relatedArtistsMap.has(artist.id)
              ) {
                // Fetch full artist info for collaborators
                // Note: We'll add them with a collaboration bonus
                relatedArtistsMap.set(artist.id, {
                  ...artist,
                  genreMatchScore: -1, // Mark as collaboration (will fetch full info)
                  isCollaborator: true,
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error(
        "Error fetching top tracks for collaborators:",
        error.message
      );
    }

    // Step 4: If we have genres, do a combined genre search
    if (targetGenres.length >= 2 && relatedArtistsMap.size < maxLimit) {
      try {
        // Combine top 2 genres for more specific results
        const combinedGenres = targetGenres.slice(0, 2).join(" ");
        const searchQuery = `genre:"${combinedGenres}"`;

        const { data: searchResults } = await getApiResponse(
          `/search?q=${encodeURIComponent(
            searchQuery
          )}&type=artist&limit=10&market=${apiConfig.MARKET}`,
          req.cookies.access_token
        );

        if (searchResults.artists && searchResults.artists.items) {
          searchResults.artists.items.forEach((artist) => {
            if (
              artist &&
              artist.id &&
              artist.id !== excludeArtistId &&
              !relatedArtistsMap.has(artist.id)
            ) {
              const genreMatchCount =
                artist.genres?.filter((g) => targetGenres.includes(g)).length ||
                0;

              relatedArtistsMap.set(artist.id, {
                ...artist,
                genreMatchScore: genreMatchCount,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error with combined genre search:", error.message);
      }
    }

    // Step 5: Fetch full info for collaborators (those marked with -1 score)
    const collaboratorIds = Array.from(relatedArtistsMap.values())
      .filter((artist) => artist.genreMatchScore === -1)
      .map((artist) => artist.id)
      .slice(0, 5); // Limit to 5 collaborators to avoid too many requests

    if (collaboratorIds.length > 0) {
      try {
        const { data: collaboratorsInfo } = await getApiResponse(
          `/artists?ids=${collaboratorIds.join(",")}`,
          req.cookies.access_token
        );

        if (collaboratorsInfo.artists) {
          collaboratorsInfo.artists.forEach((fullArtist) => {
            if (fullArtist && fullArtist.id) {
              const genreMatchCount =
                fullArtist.genres?.filter((g) => targetGenres.includes(g))
                  .length || 0;

              relatedArtistsMap.set(fullArtist.id, {
                ...fullArtist,
                genreMatchScore: genreMatchCount,
                isCollaborator: true,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching collaborator info:", error.message);
      }
    }

    // Step 6: Sort and filter results
    let relatedArtists = Array.from(relatedArtistsMap.values());

    // Sort by: collaborators first, then genre match score, then popularity
    relatedArtists.sort((a, b) => {
      // Collaborators get priority
      if (a.isCollaborator && !b.isCollaborator) return -1;
      if (!a.isCollaborator && b.isCollaborator) return 1;

      // Then by genre match score
      if (b.genreMatchScore !== a.genreMatchScore) {
        return b.genreMatchScore - a.genreMatchScore;
      }

      // Finally by popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });

    // Take top 20 and clean up metadata
    relatedArtists = relatedArtists.slice(0, maxLimit).map((artist) => {
      const { genreMatchScore, isCollaborator, ...cleanArtist } = artist;
      return cleanArtist;
    });

    return {
      artists: relatedArtists,
    };
  } catch (error) {
    console.error("Error fetching related artists:", error.message);

    // Return empty result on error
    return {
      artists: [],
    };
  }
}

module.exports = {
  getSeveralArtistsInfo,
  getArtistAlbums,
  getArtistInfo,
  getArtistTopTracks,
  getRelatedArtists,
};
