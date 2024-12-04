import React from "react";

const SearchBar = ({ placeholder, onSearch }) => {
    const handleSearch = (event) => {
        onSearch(event.target.value);
    };

    return (
        <input
            type="text"
            placeholder={placeholder}
            className="border p-2 rounded w-full"
            onChange={handleSearch}
        />
    );
};

export default SearchBar;
