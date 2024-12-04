import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Typography,
    Card,
    CardBody,
    CardFooter,
} from "@material-tailwind/react";
import { FaCartShopping } from "react-icons/fa6";
import FeedbackButton from "../../components/FeedbackModal/FeedbackButton";
import FeedbackModal from "../../components/FeedbackModal/FeedbackModal";
import useFeedback from "../../components/FeedbackModal/useFeedback";
import { fetchCustomerInventory } from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import { shuffleArray } from "../../api/helper";
import SearchBar from "../../components/SearchBar/SearchBar";

const ProductList = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const navigate = useNavigate();

    const {
        open,
        handleOpen,
        handleClose,
        handleSubmitFeedback,
        comment,
        rating,
        unit,
        setComment,
        setRating,
        setUnit,
    } = useFeedback();

    const token = localStorage.getItem("token");

    const categories = [
        "Grocery Store",
        "Restaurant",
        "Bookshop",
        "Bottled Water Industry",
    ];

    // Fetch inventory data
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await fetchCustomerInventory(token);
            setInventoryData(response); // Update based on actual API response structure
            setFilteredData(response);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            toast.error(
                "Failed to load inventory data. Please try again later.",
            );
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error("You need to be logged in to access this page.");
            setTimeout(() => {
                navigate("/customer-login");
            }, 2000);
            return;
        }
        fetchInventory();
    }, [navigate, token]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        filterData(term, selectedCategories);
    };

    const handleCategoryChange = (category) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((cat) => cat !== category)
            : [...selectedCategories, category];
        setSelectedCategories(updatedCategories);
        filterData(searchTerm, updatedCategories);
    };

    const filterData = (term, categories) => {
        const filtered = inventoryData.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(term.toLowerCase());
            const matchesCategory =
                categories.length === 0 || categories.includes(item.unit_name);
            return matchesSearch && matchesCategory;
        });
        setFilteredData(filtered);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <div className="container mx-auto px-4 py-2 my-2 lg:px-8 lg:py-4">
            <div className="grid grid-rows-1 lg:grid-cols-2">
                <div className="left flex flex-col gap-[4rem] items-start">
                    <div className="flex flex-col gap-5">
                        <SearchBar
                            placeholder="Search for Item"
                            onSearch={handleSearch}
                        />
                        <div className="category mt-5">
                            <Typography variant="h6">
                                Select a Category
                            </Typography>
                        </div>
                        <div className=" grid grid-cols-2 md:flex md:flex-col gap-5">
                            {categories.map((category) => (
                                <label key={category}>
                                    <input
                                        type="checkbox"
                                        value={category}
                                        checked={selectedCategories.includes(
                                            category,
                                        )}
                                        onChange={() =>
                                            handleCategoryChange(category)
                                        }
                                    />{" "}
                                    {category}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="optional my-[1.2rem] md:my-[2.5rem flex items-center space-x-3">
                        <FeedbackButton handleOpen={handleOpen} />
                        <FeedbackModal
                            open={open}
                            handleClose={handleClose}
                            comment={comment}
                            rating={rating}
                            unit={unit}
                            setComment={setComment}
                            setRating={setRating}
                            setUnit={setUnit}
                            handleSubmitFeedback={handleSubmitFeedback}
                        />
                        <Button
                            onClick={handleLogout}
                            className="mt-4"
                            color="red"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="w-[100%] col-span-1">
                    <Typography variant="h5" className="text-center">
                        Product Listing
                    </Typography>
                    {loading ? (
                        <Loader />
                    ) : filteredData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 w-[100%] gap-5">
                            {shuffleArray(filteredData).map((item, index) => (
                                <Card
                                    key={index}
                                    className="w-[100%] px-5 py-5 shadow-lg hover:shadow-xl transition-all duration-150 relative"
                                >
                                    <Button
                                        color="blue-gray"
                                        className="w-1/4 text-[1.1rem] hover:scale-105 cursor-pointer"
                                    >
                                        <FaCartShopping />
                                    </Button>
                                    <CardBody>
                                        <Typography
                                            variant="h6"
                                            className="text-center my-4 mx-4"
                                        >
                                            Name: {item.name}
                                        </Typography>
                                        <Typography>
                                            Description: {item.description}
                                        </Typography>
                                        <Typography>
                                            Quantity: {item.quantity}
                                        </Typography>
                                        <Typography>
                                            Price: {item.price}
                                        </Typography>
                                    </CardBody>
                                    <CardFooter className="text-[0.8rem] flex justify-end">
                                        Unit: {item.unit_name}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Typography>
                            No products available at the moment.
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
