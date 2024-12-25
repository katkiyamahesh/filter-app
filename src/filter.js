import React, { useEffect, useState } from 'react';

function Filter() {
    const [loading, setLoading] = useState(true);
    const [Catstate, CatsetState] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [SearchPost, setSearchPost] = useState('');

	// WP Total Post
    const [TotalPost, setTotalPost] = useState('');

    // Pagination post
    const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
    const [recordsPerPage] = useState(10);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
	
    const [postState, setPostState] = useState([]);
    const currentRecords =  (postState || []).slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(TotalPost / recordsPerPage)
    const pageNumbers = [...Array(nPages + 1).keys()].slice(1);
    // console.log(currentRecords);

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
        if(SearchPost){
            postApi += `&search=${encodeURIComponent(SearchPost)}`;
        }
        fetch(postApi)
        .then((response) => {
                setLoading(true);
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
                setLoading(false);
            })
            .then((postList) => {
                setPostState(postList);
            })
            .catch((error) => console.error('Error fetching posts:', error));
    }, [currentPage, selectedCat, SearchPost, Catstate]);
    
    const stripHtml = (html) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        return tempElement.textContent || tempElement.innerText || '';
    };

    const searchPost = (e) => {
        if(e.target.value){
            setSearchPost(e.target.value);
        }
    };

    const handleClearFilter = () => {
        // Reset filters
        setSelectedCat('');
        setSearchPost('');
        setCurrentPage(1);
    
        // Fetch all posts without filters
        const defaultPostApi = `https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/posts?page=${currentPage}&&per_page=${recordsPerPage}`;
        
        fetch(defaultPostApi)
        .then((response) => {
            setLoading(true);
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
            setLoading(false);
        })
        .then((postList) => {
            setPostState(postList);
        })
        .catch((error) => {
            console.error('Error fetching posts:', error);
            setLoading(false);
        });
    };

	const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePage = (pgNumber) => {
        if(pgNumber){
            setCurrentPage(pgNumber);
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
            <form action='' method='get' className='search-form'>
                <input name="keyword" className="search-field post-search" value={SearchPost} onChange={searchPost} placeholder="Search all posts"/>
            </form>
            <div className="totalpost" id="totalpost">
                <span>{TotalPost} jobs available</span>
            </div>

            <div className="postlisting">
                <div className="left-side side-bar-filter">
                    <div className='filter-heading'>
                        <h3>Filter</h3>
                        {selectedCat.length > 0 || SearchPost.length > 0 ?(
                            <button type="button" className="clear-all" onClick={handleClearFilter}>Clear All</button>
                        ): (
                            <button type="button" className="clear-all" onClick={handleClearFilter} disabled>Clear All</button>
                        )
                        }
                    </div>
                    <div className="col-post-filter">
                        <select name="category_post" value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}>
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
                    {loading ? (
                        postState.length > 0 ? (
                            <>
                            {postState.map((postData, index) => (
                                <div className="post-item" key={postData.id || index}>
                                    <h3>{postData.title.rendered}</h3>
                                    <p>{stripHtml(postData.excerpt.rendered)}</p>
                                </div>
                            ))}

                            {/* Mapping through each page number */}    
                            <span className="current-page">{`Page ${currentPage} of ${totalPages}`}</span>
                            <div className="post-pagination">
                                <a className="page-numbers" onClick={handlePreviousPage} disabled={currentPage == 1}
                                >« Previous</a>
                                {pageNumbers.map(pgNumber => (
                                    currentPage == pgNumber ? (
                                        <span key={pgNumber} aria-current="page" className="page-numbers current">{pgNumber}</span>
                                    ) : (
                                        <a onClick={(e) =>{
                                            e.preventDefault(); 
                                            handlePage(pgNumber);}} className='page-numbers' href='#'>
                                            {pgNumber}
                                        </a>
                                    )
                                ))}
                                <a className="page-numbers" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next »</a>
                            </div>
                            </>
                        ) : (
                            <p>No posts found.</p>
                        )
                    ) : (
                        <p>Loading posts...</p>
                    )}
					
					{/* Pagination */}

                </div>

            </div>
        </div>
    );
}

export default Filter;