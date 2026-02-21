import React, { useEffect, useState } from 'react';
import { movieApi } from './api';
import './Home.css';
import { Play, Info, Star, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [moviesData, setMoviesData] = useState({
        trending: [],
        popular: [],
        tvShows: [],
        movies: [],
        action: [],
        comedy: [],
        horror: [],
        romance: [],
        documentaries: []
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [heroMovie, setHeroMovie] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('Home');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchRow = async (apiFunc, genreId = null) => {
            try {
                const res = genreId ? await apiFunc(genreId) : await apiFunc();
                return res.data.results || [];
            } catch (err) {
                console.error(`Failed to fetch ${genreId || 'row'}`, err);
                return [];
            }
        };

        const fetchData = async () => {
            console.log("DEBUG: Starting data fetch from backend...");
            try {
                // Fetch core rows
                const [trending, popular, tvShows, movies] = await Promise.all([
                    fetchRow(movieApi.getTrending),
                    fetchRow(movieApi.getPopular),
                    fetchRow(movieApi.getTvShows),
                    fetchRow(movieApi.getMovies)
                ]);

                console.log("DEBUG: Fetch core rows complete", { trending: trending.length, tv: tvShows.length });
                setMoviesData(prev => ({ ...prev, trending, popular, tvShows, movies }));

                if (trending.length > 0 || popular.length > 0) {
                    const allFetched = [...trending, ...popular];
                    setHeroMovie(allFetched[Math.floor(Math.random() * allFetched.length)]);
                }

                // Fetch other genres in background
                const genres = [
                    { key: 'action', id: 28 },
                    { key: 'comedy', id: 35 },
                    { key: 'horror', id: 27 },
                    { key: 'romance', id: 10749 },
                    { key: 'documentaries', id: 99 }
                ];

                for (const genre of genres) {
                    const results = await fetchRow(movieApi.getMoviesByGenre, genre.id);
                    setMoviesData(prev => ({ ...prev, [genre.key]: results }));
                }
            } catch (err) {
                console.error("DEBUG: Error in fetchData", err);
            }
        };
        fetchData();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const res = await movieApi.searchMovies(query);
                setSearchResults(res.data.results);
            } catch (err) {
                console.error('Search failed', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleMovieClick = (id) => {
        navigate(`/movie/${id}`);
    };

    const MovieRow = ({ title, movies }) => (
        <div className="movie-row">
            <h2 className="row-title">{title}</h2>
            <div className="row-posters">
                {movies?.map((movie) => (
                    movie.poster_path && (
                        <div
                            key={movie.id}
                            className="movie-card"
                            onClick={() => handleMovieClick(movie.id)}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                alt={movie.title}
                                loading="lazy"
                            />
                            <div className="card-overlay">
                                <div className="card-top">
                                    <Star size={14} fill="#e50914" color="#e50914" />
                                    <span>{movie.vote_average?.toFixed(1)}</span>
                                </div>
                                <h3 className="card-title">{movie.title || movie.name}</h3>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );

    return (
        <div className="home-container">
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-left">
                    <h1 className="main-logo" onClick={() => { setActiveTab('Home'); window.scrollTo(0, 0); }}>MOVIEFLIX</h1>
                    <ul className="nav-links">
                        <li className={activeTab === 'Home' ? 'active' : ''} onClick={() => setActiveTab('Home')}>Home</li>
                        <li className={activeTab === 'TV Shows' ? 'active' : ''} onClick={() => setActiveTab('TV Shows')}>TV Shows</li>
                        <li className={activeTab === 'Movies' ? 'active' : ''} onClick={() => setActiveTab('Movies')}>Movies</li>
                        <li className={activeTab === 'New & Popular' ? 'active' : ''} onClick={() => setActiveTab('New & Popular')}>New & Popular</li>
                    </ul>
                </div>
                <div className="nav-right">
                    <div className="search-container-nav">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Titles, people, genres"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                    <div className="profile-container"
                        onMouseEnter={() => setShowProfileMenu(true)}
                        onMouseLeave={() => setShowProfileMenu(false)}>
                        <div className="avatar-circle">
                            {user?.username?.charAt(0).toUpperCase() || <User size={20} />}
                        </div>
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="user-info">
                                    <p className="user-name">{user?.username || 'User'}</p>
                                    <p className="user-email">{user?.email || 'user@example.com'}</p>
                                </div>
                                <div className="divider"></div>
                                <button className="profile-action">Account</button>
                                <button className="profile-action">Help Center</button>
                                <button className="logout-action" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {searchQuery.length > 2 ? (
                <div className="search-results-page">
                    <MovieRow title={`Search Results for "${searchQuery}"`} movies={searchResults} />
                </div>
            ) : (
                <>
                    {heroMovie && (
                        <div
                            className="hero-banner"
                            style={{
                                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(20,20,20,0.8) 70%, rgba(20,20,20,1) 100%), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`
                            }}
                        >
                            <div className="hero-content">
                                <h1 className="hero-title">{heroMovie.title || heroMovie.name}</h1>
                                <p className="hero-overview">{heroMovie.overview}</p>
                                <div className="hero-buttons">
                                    <button className="play-btn">
                                        <Play fill="black" size={20} /> Play
                                    </button>
                                    <button className="info-btn" onClick={() => handleMovieClick(heroMovie.id)}>
                                        <Info size={20} /> More Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="content-rows">
                        {(activeTab === 'Home' || activeTab === 'New & Popular') && (
                            <>
                                <MovieRow title="Trending Now" movies={moviesData.trending} />
                                <MovieRow title="Popular on Movieflix" movies={moviesData.popular} />
                            </>
                        )}

                        {(activeTab === 'Home' || activeTab === 'TV Shows') && (
                            <MovieRow title="TV Shows" movies={moviesData.tvShows} />
                        )}

                        {(activeTab === 'Home' || activeTab === 'Movies') && (
                            <MovieRow title="Top Rated Movies" movies={moviesData.movies} />
                        )}

                        {(activeTab === 'Home' || activeTab === 'Movies') && (
                            <>
                                <MovieRow title="Action Movies" movies={moviesData.action} />
                                <MovieRow title="Comedy Hits" movies={moviesData.comedy} />
                                <MovieRow title="Scary Movies" movies={moviesData.horror} />
                                <MovieRow title="Romance" movies={moviesData.romance} />
                                <MovieRow title="Documentaries" movies={moviesData.documentaries} />
                            </>
                        )}
                    </div>
                </>
            )}

            <footer className="footer">
                <p>&copy; 2024 Movieflix. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
