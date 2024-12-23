import React, { useEffect, useState } from 'react';

function Filter() {
    const [Catstate, CatsetState] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
	// WP Total Post
    const [TotalPost, setTotalPost] = useState('');

    // Pagination post
    const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
    const [recordsPerPage] = useState(10);
	
    const [postState, setPostState] = useState([]);

    // Fetch categories
    useEffect(() => {
        fetch('https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/categories')
            .then((response) => response.json())
            .then((catjson) => {
                CatsetState(catjson);
            })
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    // Fetch posts based on selected category
    useEffect(() => {
        // let postApi = 'https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/posts';
        let postApi = `https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/posts?page=${currentPage}&per_page=${recordsPerPage}`;
        if (selectedCat) {
            const selectedCategory = Catstate.find((cat) => cat.slug === selectedCat);
            if (selectedCategory) {
                postApi += `&categories=${selectedCategory.id}`;
            }
        }
        fetch(postApi)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
				const totalPagesFromHeader = response.headers.get("x-wp-totalpages");
				if (totalPagesFromHeader) {
					setTotalPages(parseInt(totalPagesFromHeader, 10));
				}
				const numPosts = response.headers.get('x-wp-total');
				setTotalPost(numPosts);

                return response.json();
            })
            .then((postList) => {
                setPostState(postList);
            })
            .catch((error) => console.error('Error fetching posts:', error));
    }, [currentPage, selectedCat, Catstate]);
    const stripHtml = (html) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        return tempElement.textContent || tempElement.innerText || '';
    };

	const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    return (
        <div className="container">
            <h1 className="text-center">Post Listing</h1>
            <div className="totalpost" id="totalpost">
                <span>{TotalPost} jobs available</span>
            </div>

            <div className="postlisting">
                <div className="left-side side-bar-filter">
                    <h3>Filter</h3>
                    <div className="col-post-filter">
                        <select
                            name="category_post"
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {Catstate.map((cat_detail) => (
                                <option key={cat_detail.id} value={cat_detail.slug}>
                                    {cat_detail.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="right-side post-data">
                    {postState.length > 0 ? (
                        postState.map((postData, index) => (
                            <div className="post-item" key={postData.id || index}>
                                <h3>{postData.title.rendered}</h3>
                                <p>{stripHtml(postData.excerpt.rendered)}</p>
                            </div>
                        ))
                    ) : (
                        <p>Loading posts...</p>
                    )}
					
					{/* Pagination */}
					<div className="post-pagination">
						<a className="page-numbers" onClick={handlePreviousPage} disabled={currentPage === 1}
						> « Previous</a>
						<span className="current-page">{`Page ${currentPage} of ${totalPages}`}</span>
						<a className="page-numbers" onClick={handleNextPage} disabled={currentPage === totalPages}>
						Next »</a>
					</div>

                </div>

            </div>
        </div>
    );
}

export default Filter;