import React, { useState } from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import { Search } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ href = '/SearchResult' }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`${href}?q=${encodeURIComponent(query)}`);
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