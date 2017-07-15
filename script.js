var allData, page_number = 0, num_of_all_posts = 0, num_of_saved_tags = 0, savedTags = [];


window.onload = function(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://api.myjson.com/bins/152f9j', true);
	xhr.send();
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		if (xhr.status != 200) {
		  alert( xhr.status + ': ' + xhr.statusText );
		} else {
			try {
				allData = JSON.parse(xhr.responseText);
			} catch (e) {
				alert(e.message );
			}

			num_of_all_posts = countPostsInArr(allData.data);
			checkTags();
			sortByTagsThenByDate();
			loadContent(allData.data);
			search();

		}
	}
}

function loadOnePost(Data, post_number){
	let new_post = document.createElement('li');
		new_post.className = "post";
		let current_node = document.getElementById('Post_list');
		current_node.appendChild(new_post);

		let Title = document.createElement('h2');
		Title.className = "title";
		Title.innerHTML = Data[post_number].title;
		new_post.appendChild(Title);

		let Img = document.createElement('img');
		Img.className = "image";
		Img.src = Data[post_number].image;
		new_post.appendChild(Img);

		let Description = document.createElement('p');
		Description.className = "description";
		Description.innerHTML = Data[post_number].description;
		new_post.appendChild(Description);

		let CreatedAt = document.createElement('p');
		CreatedAt.className = "createdAt";
		CreatedAt.innerHTML = new Date(Data[post_number].createdAt).toLocaleString();
		new_post.appendChild(CreatedAt);

		let ul_tags = document.createElement('ul');
		ul_tags.className = "tags";
		new_post.appendChild(ul_tags);

		let allTags = Data[post_number].tags;
		for (j in allTags){
			let new_tag = document.createElement('li');
			new_tag.innerHTML = allTags[j];
			ul_tags.appendChild(new_tag);
		}

		let removeButton = document.createElement('button');
		removeButton.className = "removeButton";
		removeButton.innerHTML = "Remove post";
		removeButton.type = "button";
		removeButton.name = Data[post_number].title;
		removeButton.addEventListener("click", removePost);
		new_post.appendChild(removeButton);	
}

function loadContent(Data){
	var local_num_of_posts = countPostsInArr(Data);
	for (i = 0+(page_number*10); i < 10+(page_number*10); i++){
		if (i >= local_num_of_posts)
			break;
		loadOnePost(Data, i);	
	}
	page_number++;
}

function countPostsInArr(Data){
	let count = 0;
	for (let q in Data)
		count++;
	return count;
}

function checkTags(){
	savedTags = localStorage["tags"].split(',');
	if ((savedTags == undefined) || (savedTags == "")){
		document.getElementById('popup').style.top = "0px";
		num_of_saved_tags = 0;
		return;
	}
	num_of_saved_tags = savedTags.length;
}


function saveTags(){
	var checkedValue = []; 
	var inputElements = document.getElementsByClassName('tags');
	for(var i=0; inputElements[i]; i++){
		if(inputElements[i].checked){
			checkedValue.push(inputElements[i].value);
		}
	}
	localStorage["tags"] = checkedValue;
	document.getElementById('popup').style.top = "99999px";
}

function sortByTagsThenByDate(){
	if (num_of_saved_tags == 0){
		allData.data.sort(sortByDate);
		return;
	}
	var id_posts_with_saved_tags = postsWithSavedTags();
	var arr1 = [], arr2 = [];
	for (let i=0; i < num_of_all_posts; i++)
	{
		if (id_posts_with_saved_tags.indexOf( i) != -1)
			arr1.push(allData.data[i]);
		else
			arr2.push(allData.data[i]);
	}
	arr1.sort(sortByDate);
	arr2.sort(sortByDate);
	allData.data = arr1.concat(arr2);
}

function postsWithSavedTags(){
	let posts_with_saved_tags = [];
	for (let i=0; i < num_of_all_posts; i++){
		let allTags = allData.data[i].tags;
		let count_tags = 0;
		for (let j = 0; j<num_of_saved_tags; j++)
		{
			if ( allTags.indexOf( savedTags[j]) != -1 )
			{
				count_tags++;
			}
		}
		if (count_tags == num_of_saved_tags)
			posts_with_saved_tags.push(i);
	}
	return posts_with_saved_tags;
}

function sortByDate(post1, post2){
    return new Date(post2.createdAt) - new Date(post1.createdAt);
}


function removePost(){
	let titleOfPost = this.name;
	let post = this.parentNode;
	let parentElem = document.getElementById('Post_list');
	parentElem.removeChild(post);

	for (let i = 0; i < num_of_all_posts; i++){
		if (allData.data[i].title == titleOfPost){
			allData.data.splice(i,1);
			break;
		}
	}
	num_of_all_posts--;
}


function search(){
	var search_field = document.getElementById('search');
	search_field.oninput = function(){
		var mainNode = document.getElementById("Post_list");
		while (mainNode.firstChild) {
		    mainNode.removeChild(mainNode.firstChild);
		}
		page_number = 1;
		let posts = [];
		for (let i = 0; i < num_of_all_posts; i++){
			if (allData.data[i].title.indexOf(search_field.value) != -1)
				posts.push(allData.data[i]);
		}
		for (let i = 0; i < posts.length; i++)
		{
			loadOnePost(posts, i);
			if (i == 9)
				break;
		}

		window.onscroll = function (){
			if(document.body.scrollTop >= document.body.scrollHeight - document.body.clientHeight - 250)
				loadContent(posts);	
		};
	}
}

window.onscroll = function(){
	if(document.body.scrollTop >= document.body.scrollHeight - document.body.clientHeight - 250)
		loadContent(allData.data);	
};



