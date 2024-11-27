import React, { useEffect, useState } from 'react';

function Filter() {
    const [activeIndex, setActiveIndex] = useState(-1);
	const handleClick = (index) => {
	    setActiveIndex(index === activeIndex ? -1 : index);
	};

	const data = [
		{
		id:'1',
		header: "What is Colonoscopy?",
		subheading: <h5>Fasting</h5>,
		content:"You should fast for at least 6 hours prior to your colonoscopy. You may drink clear fluid up to 2 hours before the procedure but milk is not allowed during the fasting.",
		subheading1:<h5>Bowel Preparation</h5>,
		content1:"For a successful colonoscopy, you should follow the instruction of the bowel preparation given to you.In general, most medication should be continued before the colonoscopy with the exception of diabetes medication and blood thinners. Diabetic medication should be omitted during fasting. You should check with your doctor if your blood thinner needs to be discontinued prior to the procedure."
		},
		{
		id:'2',
		header: "What Happens After A Colonoscopy?",
		content: "As you will be given medication to make you sleepy, you must not drive, work or make any important decision after the procedure. Medical Certificate will be issued if needed and you should rest at home for the rest of the day.",
		},
		{
		id:'3',
		header: "Can I Use Medisave & Insurance?",
		content: "We collaborate with the vast majority of health insurers. Please feel free to contact our friendly clinic staff to assist you with the financing options.",
		},
	];
     
    const [Catstate , CatsetState] = useState([]);
    const [selectedCat, setSelectedCat] = useState('');
	
	useEffect(() => {
		const postcat=fetch('https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/categories');
		const catjson = postcat.then((res,date)=>{
			// console.log(respon);
			return res.json();
		}).then((catjson)=>{
			// console.log(catjson);
			CatsetState(catjson);
		});
	}, []);

    const [postState , setPostState] = useState([]);

	useEffect(() => {
		const post = fetch('https://dev-wpmahesh.pantheonsite.io/wp-json/wp/v2/posts')
		.then((response) => response.json())
		.then((postList) => {
			setPostState(postList);
		})
		.catch((error) => console.error('Error fetching posts:', error));
	}, []);
	const stripHtml = (html) => {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	};
	
  return (
    <div className="main-container">
		<section className="section-frequently">
			<div className="col-freuently">
				<div className="freuently-heading">
					<h2>Learn More</h2>
					<h3>Frequently Asked Questions</h3>
				</div>
					{data.map((section, id) => (
						<div key={id}>
							<div className="accordion" style={{padding: "10px",cursor: "pointer",}}
							onClick={() => handleClick(id)}>
								<div className="accordion-title">{section.header}</div>
								<i className="fa-regular fa-chevron-down"></i>
							</div>

							{activeIndex === id && (
							<div className="accordion-content" style={{ background: "white",padding: "10px",}}>
								{section.subheading}
								{section.content}
								{section.subheading1}
								{section.content1}
							</div>
							)}
						</div>
					))}
			</div>
        </section>

		<section>
			<div className='side-bar-fillter left-side'>
				<h3>Filter</h3>
				<div className="col-blogpost">
				<select name='category_post' value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
					<option value="" >Select Category</option>
					{
						Catstate.map((cat_detail, id) => {
							return(
							<option value={cat_detail.slug} data-id={cat_detail.id}>{cat_detail.name}</option>
							)
						})
					}
				</select>
				</div>
			</div>
			<div className='right-side post-listing'>
				{postState.length > 0 ? (
					postState.map((postData, id) => {
						return(
						<div className='post-item'>
							<h3>{postData.title.rendered}</h3>
							<p>{stripHtml(postData.excerpt.rendered)}</p>
						</div>
						)
					})
				) : (
					<p>Loading posts...</p>
				)}
			</div>
		</section>
    </div>
  );

}

export default Filter;