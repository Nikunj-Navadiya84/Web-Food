import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { StoreContext } from '../Context/StoreContext';
import { BiSolidStar } from "react-icons/bi";
import { BiSolidStarHalf } from "react-icons/bi";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { Link } from 'react-router-dom';

import axios from "axios";

function Deal() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const closeModal = () => setSelectedProduct(null);
    const [imageIndex, setImageIndex] = useState(0);
    const [reviews, setReviews] = useState({});
    const { addToCart, handleQuantityChange, quantity, likedProducts, removeFromWishlist, addToWishlist } = useContext(StoreContext);

    // Fetch Product
    useEffect(() => {
        const fetchProductsAndReviews = async () => {
            try {
                const productRes = await axios.get("http://localhost:4000/api/products/list");
                if (productRes.data.success && Array.isArray(productRes.data.products)) {
                    setProducts(productRes.data.products);

                    // Fetch reviews for each product
                    productRes.data.products.forEach(async (product) => {
                        try {
                            const reviewRes = await axios.get(`http://localhost:4000/api/client/list/${product._id}`);
                            if (reviewRes.data.success) {
                                setReviews(prev => ({
                                    ...prev,
                                    [product._id]: reviewRes.data.reviews || []
                                }));
                            }
                        } catch (reviewError) {
                            console.error(`Failed to fetch reviews for product ${product._id}`, reviewError);
                        }
                    });
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            }
        };

        fetchProductsAndReviews();
    }, []);

    // Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setImageIndex(0);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (selectedProduct) fetchReviews(selectedProduct._id);
    }, [selectedProduct]);

    const fetchReviews = async (productId) => {
        if (reviews[productId]) return;
        try {
            setLoadingReviews(true);
            const response = await axios.get(`http://localhost:4000/api/client/list/${productId}`);
            if (response.data.success) {
                setReviews((prev) => ({
                    ...prev,
                    [productId]: response.data.reviews || []
                }));
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    return (
        <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-20">
            <div className='flex justify-between items-center flex-wrap gap-3'>
                <div>
                    <h1 className='sm:text-4xl text-3xl text-gray-700 pb-2 font-medium'>
                        Day of the <span className='text-green-600'>Deal</span>
                    </h1>
                    <p className='text-sm text-gray-500'>Don’t wait. The time will never be just right.</p>
                </div>
                <Link to='/categories'>
                    <button className='text-white text-sm bg-gray-700 py-2 px-3 rounded cursor-pointer hover:bg-gray-900'>
                        View All Products
                    </button>
                </Link>
            </div>

            {/* Product Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-9'>
                {products.slice(0, 4).map((product, index) => (
                    <motion.div
                        key={index}
                        className='border border-gray-200 cursor-pointer rounded-lg overflow-hidden'
                        transition={{ duration: 0.9 }}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <div className='relative overflow-hidden'>
                            <img
                                src={`${product.images?.[0].url}`}
                                className=' h-70 w-full object-cover transition-transform duration-300 hover:scale-105'
                                alt={product.name}
                            />
                            <hr className='border-gray-200 absolute bottom-0 left-0 w-full' />
                        </div>

                        <div className='p-5'>
                            <div className='flex justify-between'>
                                <div>
                                    <h3 className='text-gray-500 text-sm mb-2'>{product.weight} {product.categories} </h3>
                                    <p onClick={() => setSelectedProduct(product)} className='text-gray-800 text-sm mb-2'>{product.name}</p>
                                </div>
                                <div>
                                    <button className="cursor-pointer" onClick={() => likedProducts[product._id] ? removeFromWishlist(product) : addToWishlist(product)}>
                                        {likedProducts[product._id] ? (
                                            <FaHeart className="text-xl text-red-500" />
                                        ) : (
                                            <FaRegHeart className="text-xl text-red-300" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {reviews[product._id] && reviews[product._id].length > 0 && (
                                <div className="space-y-4 mb-1">
                                    <div className="flex items-center gap-2 text-yellow-500 text-lg font-medium">
                                        <div className="flex items-center">
                                            {[...Array(Math.floor(reviews[product._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[product._id].length))].map((_, i) => (
                                                <BiSolidStar key={i} />
                                            ))}
                                            {(reviews[product._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[product._id].length) % 1 !== 0 && <BiSolidStarHalf />}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({(reviews[product._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[product._id].length).toFixed(1)} out of 5)
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className='flex  items-center justify-between'>
                                <div>
                                    <p className='text-sm text-gray-600 line-through mt-1'>${product.price.toFixed(2)}</p>
                                    <p className='text-md text-gray-900 font-bold mb-3 '>${product.offerPrice.toFixed(2)}</p>
                                </div>
                                <button
                                    disabled={product.quantity === 0}
                                    className={`text-sm text-white py-2 px-3 rounded cursor-pointer ${product.quantity === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-800'}`}
                                    onClick={() => product.quantity > 0 && addToCart(product, 1)}
                                >
                                    {product.quantity === 0 ? "Out of Stock" : "Buy Now"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal for Product Details */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        className='fixed inset-0 backdrop-brightness-40 flex justify-center items-center z-50 overflow-y-auto p-10'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className='bg-white max-h-[90vh] overflow-auto p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl relative'
                            initial={{ scale: 0.7 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.7 }}
                        >
                            <button
                                className='absolute top-2 right-2 text-gray-500 text-lg cursor-pointer z-50'
                                onClick={closeModal}
                            >
                                <FaTimes className='text-2xl' />
                            </button>

                            <div className='flex flex-col md:flex-row items-center gap-6'>
                                <div className="relative flex flex-col w-full md:w-1/2 justify-center items-center">
                                    <img
                                        src={selectedProduct.images?.[imageIndex]?.url}
                                        className="border border-gray-200 rounded-lg w-60 h-40 object-cover"
                                        alt="Product"
                                    />
                                    <div className="absolute 2xl:inset-[-45px] sm:inset-[90px] md:inset-[-45px] inset-[-25px] flex justify-between items-center gap-4 px-4">
                                        <button onClick={() =>
                                            setImageIndex(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1)
                                        }>
                                            <MdOutlineKeyboardDoubleArrowLeft className="text-4xl text-gray-400" />
                                        </button>
                                        <button onClick={() =>
                                            setImageIndex(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0)
                                        }>
                                            <MdOutlineKeyboardDoubleArrowRight className="text-4xl text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className='p-1 md:p-5 w-full'>
                                    <h2 className='text-gray-700 text-md font-semibold mb-1'>{selectedProduct.name}</h2>
                                    <span className='text-gray-500 text-xs mb-1'>{selectedProduct.weight}</span>
                                    <p className='text-sm text-gray-600 mb-1'>{selectedProduct.description}</p>

                                    {Array.isArray(reviews[selectedProduct._id]) && reviews[selectedProduct._id].length > 0 && (
                                        <div className="space-y-4 mb-1">
                                            {/* Average Rating Section */}
                                            <div className="flex items-center gap-2 text-yellow-500 text-lg font-medium">
                                                <div className="flex items-center">
                                                    {[...Array(Math.floor(
                                                        reviews[selectedProduct._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[selectedProduct._id].length
                                                    ))].map((_, i) => (
                                                        <BiSolidStar key={i} />
                                                    ))}
                                                    {(
                                                        reviews[selectedProduct._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[selectedProduct._id].length
                                                    ) % 1 !== 0 && <BiSolidStarHalf />}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    ({(reviews[selectedProduct._id].reduce((acc, cur) => acc + cur.review, 0) / reviews[selectedProduct._id].length).toFixed(1)} out of 5)
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <p className='text-sm text-gray-600 line-through mb-1'>${selectedProduct.price.toFixed(2)}</p>
                                    <p className='text-md text-gray-900 font-bold mb-1'>${selectedProduct.offerPrice.toFixed(2)}</p>

                                    {/* Quantity and Add to Cart */}
                                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                        <input type="number" className="w-16 sm:w-20 px-3 py-2 border rounded" min="1" value={quantity} onChange={handleQuantityChange} />

                                        <button
                                            disabled={selectedProduct.quantity === 0}
                                            className={`text-sm text-white py-2 px-3 rounded ${selectedProduct.quantity === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-800'}`}
                                            onClick={() => {
                                                if (selectedProduct.quantity > 0) {
                                                    addToCart(selectedProduct, quantity);
                                                    closeModal();
                                                }
                                            }}
                                        >
                                            {selectedProduct.quantity === 0 ? "Out of Stock" : "Add To Cart"}
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default Deal;
