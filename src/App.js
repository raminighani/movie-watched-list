import { useEffect, useReducer, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";

// App ------------------------------------------------------

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoadnig] = useState(false);
  const [eror, setEror] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);
  // });

  // useEffect(function () {
  //   console.log("A");
  // }, []);
  // useEffect(function () {
  //   console.log("B");
  // });
  // useEffect(
  //   function () {
  //     console.log("C");
  //   },
  //   [query]
  // );

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatchMovie(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleRemoveMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // useEffect(
  //   function () {
  //     localStorage.setItem("watched", JSON.stringify(watched));
  //   },
  //   [watched]
  // );

  useEffect(function () {
    document.addEventListener("keydown", function (e) {
      if (e.code === "Escape") {
        handleCloseMovie();
      }
    });
  }, []);

  useEffect(
    function () {
      const controler = new AbortController();
      async function fetchMovie() {
        try {
          setIsLoadnig(true);
          setEror("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controler.signal }
          );
          if (!res.ok) throw new Error("somthint went wrong");

          const data = await res.json();
          if (data.Respons === "false") throw new Error("somthint went wrong");
          setMovies(data.Search);
          setEror("");
        } catch (err) {
          console.log(err.message);
          if (err.name !== "AbortError") {
            setEror(err.message);
          }
        } finally {
          setIsLoadnig(false);
        }
      }

      if (!query.length || query.length < 3) {
        setMovies([]);
        setEror("");
        return;
      }
      handleCloseMovie();
      fetchMovie();

      return function () {
        controler.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <SearchBox query={query} setQuery={setQuery} />
        <Result movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieLists movies={movies} />}</Box> */}
          {isLoading && <Loader />}
          {!isLoading && !eror && (
            <MovieLists movies={movies} handleSelectedId={handleSelectedId} />
          )}
          {eror && <ErrorMessage message={eror} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatch={handleAddWatchMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieLists
                watched={watched}
                onClick={handleSelectedId}
                onRemove={handleRemoveMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// Loader ------------------------------------------------------

function Loader() {
  return <p className="loader">LOADING...</p>;
}

// ErrorMessage ------------------------------------------------------

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>{message}</span>
    </p>
  );
}

// NavBar ------------------------------------------------------

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Logo -----------------------------------------------------------

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Movie Watched List</h1>
    </div>
  );
}

// SearchBox -------------------------------------------------------------------------------------------------------------------

function SearchBox({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

// Result ------------------------------------------------------------------------------------------------------------------------------------------------------

function Result({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies ? movies.length : 0}</strong> results
    </p>
  );
}
// Nav Bar End

// Main ------------------------------------------------------------

function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Box --------------------------------------------------------------

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// MovieLists ----------------------------------------------------------

function MovieLists({ movies, handleSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedId={handleSelectedId}
        />
      ))}
    </ul>
  );
}

// Movie ------------------------------------------------------------

function Movie({ movie, handleSelectedId }) {
  return (
    <li onClick={() => handleSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

//  MovieDetails -------------------------------------------------------

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  //State And Variable

  const [movie, setMovie] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watvhedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: ditector,
    Genre: genre,
  } = movie;

  //State And Variable End

  //---------------------------------------------

  // Handle Function

  function handleAdd() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime?.split(" ").at(0)),
      userRating,
    };
    onAddWatch(newWatchMovie);
    onCloseMovie(null);
  }

  // Handle Function End

  //---------------------------------------------

  //   Efects

  useEffect(
    function () {
      if (!title) return;
      document.title = `movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );
  useKey("Escape", onCloseMovie);
  // useEffect(
  //   function () {
  //     function callBack(e) {
  //       if (e.code === "Escape") {
  //         onCloseMovie();
  //       }
  //     }

  //     document.addEventListener("keydown", callBack);

  //     return function () {
  //       document.removeEventListener("keydown", callBack);
  //     };
  //   },
  //   [onCloseMovie]
  // );

  useEffect(
    function () {
      setIsLoaded(true);
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoaded(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  //   Efects End

  return (
    <div className="details">
      {isLoaded ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>

            <img src={poster} alt={`poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>{imdbRating} imdbRating</span>
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={25}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to lists
                    </button>
                  )}
                </>
              ) : (
                <p>you rating this movie {watvhedUserRating}</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>acors : {actors}</p>
            <p>Director : {ditector}</p>
          </section>
          {selectedId}
        </>
      )}
    </div>
  );
}

// WatchedSummary ----------------------------------------------------------------

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => Math.round(movie.imdbRating))
  );
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

// WatchedMovieLists -------------------------------------------------------------

function WatchedMovieLists({ watched, onClick, onRemove }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onClick={onClick}
          watched={watched}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

// WatchedMovie --------------------------------------------------------------------

function WatchedMovie({ movie, onClick, watched, onRemove }) {
  return (
    <>
      <li style={{ cursor: "pointer" }}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button className="btn-delete" onClick={() => onRemove(movie.imdbID)}>
            X
          </button>
        </div>
      </li>
    </>
  );
}
