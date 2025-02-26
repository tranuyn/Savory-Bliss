import React from 'react';
import { Form, FormControl, Button } from 'react-bootstrap';
import { Search } from "lucide-react";
import './SearchBar.css';

const SearchBar = () => (
    <Form className="d-flex search-bar align-items-center">
        <div className="input-group">
            <FormControl type="search"
                placeholder="Find a recipe"
                className="rounded-start-pill  px-3" />
            <Button className="search-button rounded-end-pill d-flex align-items-center">
                <Search className="text-white" size={18} />
            </Button>
        </div>
    </Form>
);

export default SearchBar;
