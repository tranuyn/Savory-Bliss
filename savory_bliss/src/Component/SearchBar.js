import React, { useState, useEffect } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ href = '/SearchResult' }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Sync query from URL params
    useEffect(() => {
        const queryParam = searchParams.get('query');
        if (queryParam) {
            setQuery(queryParam);
        }
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Use 'query' parameter name to match backend expectation
            navigate(`${href}?query=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <Form className="d-flex search-bar align-items-center" onSubmit={handleSubmit}>
            <div className="input-group">
                <FormControl 
                    type="search"
                    placeholder="Find a recipe"
                    className="rounded-start-pill px-3"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button 
                    type="submit"
                    className="search-button rounded-end-pill d-flex align-items-center">
                    <Search className="text-white" size={18} />
                </Button>
            </div>
        </Form>
    );
};

export default SearchBar;