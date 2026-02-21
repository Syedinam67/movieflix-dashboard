import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi } from './api';
import './Details.css';
import { ArrowLeft, Play, Plus, Star } from 'lucide-react';

const Details = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await movieApi.getMovieDetails(id);
                setMovie(response.data);
            } catch (err) {
                console.error('Failed to fetch movie details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!movie) return <div className="error">Movie not found</div>;

    return (
        <div className="details-container">
            <div
                className="details-bg"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(20,20,20,1) 30%, rgba(20,20,20,0) 100%), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                }}
            ></div>

            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft /> Back
            </button>

            <div className="details-content">
                <div className="details-info">
                    <h1>{movie.title}</h1>
                    <div className="meta-info">
                        <span className="rating-badge"><Star size={16} fill="gold" /> {movie.vote_average.toFixed(1)}</span>
                        <span>{movie.release_date.split('-')[0]}</span>
                        <span>{movie.runtime} min</span>
                        <span className="adult-tag">{movie.adult ? '18+' : '13+'}</span>
                    </div>

                    <p className="overview">{movie.overview}</p>

                    <div className="genres">
                        {movie.genres.map(g => <span key={g.id}>{g.name}</span>)}
                    </div>

                    <div className="action-btns">
                        <button className="play-btn"><Play fill="black" /> Play</button>
                        <button className="list-btn"><Plus /> My List</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;
