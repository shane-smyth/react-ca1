class AttractionsForm extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            attractions: [],
            selectedTag: "All Tags",
            selectedAttractions: [],
            searchQuery: "",
            showFreeOnly: false,
            minRating: 5,
            sortBy: "none",
            selectedAttraction: null,
            showAddModal: false,
            showTagManger: false,
            uniqueTags: [],
        }
    }

    componentDidMount()
    {
        fetch("dublin_attractions.json")
            .then(response => response.json())
            .then(attractions => {
                let updatedAttractions = attractions.map(attraction => { //https://www.scaler.com/topics/add-property-to-object-javascript/
                    if (attraction.description.toLowerCase().includes("free")) // adding the free property
                    {
                        attraction.free = "yes"
                    }
                    else {
                        attraction.free = "no"
                    }
                    return attraction
                })
                this.setState({attractions: updatedAttractions, selectedAttractions: updatedAttractions})
                this.getUniqueTags() // calling the method that add the unique tags to the state
                // console.log(updatedAttractions)
            })
    }

    // functions for filtering and sorting the attractions
    handleTagChange = (selectedTag) =>
    {
        this.setState({selectedTag}, this.updateFilteredAttractions)
    }
    handleSearchChange = (searchQuery) =>
    {
        this.setState({searchQuery}, this.updateFilteredAttractions)
    }
    handleShowOnlyFreeChange = (showFreeOnly) =>
    {
        this.setState({showFreeOnly}, this.updateFilteredAttractions)
    }
    handleRatingChange = (minRating) =>
    {
        this.setState({minRating}, this.updateFilteredAttractions)
    }
    handleSortChange = (sortBy) =>
    {
        this.setState({sortBy}, this.updateFilteredAttractions)
    }

    updateFilteredAttractions = () =>
    {
        let {attractions, selectedTag, searchQuery, showFreeOnly, minRating, sortBy} = this.state // uses the values gotten from the filtering handlers
        let filteredAttractions = attractions.filter(attraction =>
        {
            let matchesTag =
                selectedTag === "All Tags" ||
                (selectedTag === "None" && (!attraction.tags || attraction.tags.length === 0)) ||
                (attraction.tags && attraction.tags.includes(selectedTag))

            let matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase())

            let matchesFree = !showFreeOnly || attraction.free === "yes"

            let matchesRating = attraction.rating <= minRating


            return matchesTag && matchesSearch && matchesFree && matchesRating
        })

        if (sortBy === "Name") {
            filteredAttractions.sort((a, b) => a.name.localeCompare(b.name))
        }
        else if (sortBy === "Rating") {
            filteredAttractions.sort((a, b) =>  b.rating - a.rating)
        }

        this.setState({selectedAttractions: filteredAttractions})
    }

    handleSaveChanges = (updatedAttraction) => {
        let updatedAttractions = this.state.attractions.map((attraction) =>
            attraction.id === updatedAttraction.id ? updatedAttraction : attraction
        )

        this.setState({
            attractions: updatedAttractions,
            selectedAttractions: updatedAttractions, 
        })
    }

    handleDeleteChanges = (deletedAttraction) =>
    { // https://www.geeksforgeeks.org/how-to-remove-specific-json-object-from-array-javascript/#using-for-loop
        let updatedAttractions = this.state.attractions
        let index = this.state.attractions.findIndex(attraction => attraction.id === deletedAttraction.id)
        if (index !== -1) {
            updatedAttractions.splice(index, 1)
        }
        this.setState({
            attractions: updatedAttractions,
            selectedAttractions: updatedAttractions,
        })
    }

    handleAddModal = () =>
    {
        this.setState({showAddModal: true})
    }

    handleCloseAddModal = () =>
    {
        this.setState({showAddModal: false})
    }

    handleAddAttraction = (newAttraction) => {
        this.setState({
            attractions: [...this.state.attractions, newAttraction],
            selectedAttractions: [...this.state.selectedAttractions, newAttraction],
            showAddModal: false,
        })
    }


    handleTagManger = () =>
    {
        this.setState({showTagManger: true})
    }

    handleCloseTagManger = () =>
    {
        this.setState({showTagManger: false})
    }

    getUniqueTags = () =>
    {
        let allTags = this.state.attractions.flatMap(attraction => attraction.tags)
        let uniqueTags = [...new Set(allTags)].sort()
        this.setState({uniqueTags: uniqueTags})
        console.log(uniqueTags)
    }

    handleAddTag = (newTag) => {
        if (!this.state.uniqueTags.includes(newTag)) {
            this.setState({uniqueTags: [...this.state.uniqueTags, newTag],})
        }
    }

    handleEditTag = (oldTag, newTag) => {
        // update uniqueTags by replacing old tag with new one
        let updatedTags = this.state.uniqueTags.map(tag =>
            tag === oldTag ? newTag : tag
        )

        // update each attraction’s tags list by replacing old tag with new tag
        let updatedAttractions = this.state.attractions.map(attraction => {
            if (attraction.tags && attraction.tags.includes(oldTag)) {
                let updatedAttractionTags = attraction.tags.map(tag =>
                    tag === oldTag ? newTag : tag
                )
                return {...attraction, tags: updatedAttractionTags}
            }
            return attraction
        })

        this.setState({
            uniqueTags: updatedTags,
            attractions: updatedAttractions,
            selectedAttractions: updatedAttractions,
        })
    }

    handleDeleteTag = (tagToDelete) => {
        // remove the tag from uniqueTags
        let updatedTags = this.state.uniqueTags.filter(tag => tag !== tagToDelete)

        // Remove the tag from each attraction's tags list if it exists
        let updatedAttractions = this.state.attractions.map(attraction => {
            if (attraction.tags && attraction.tags.includes(tagToDelete)) {
                let filteredTags = attraction.tags.filter(tag => tag !== tagToDelete)
                return {...attraction, tags: filteredTags.length ? filteredTags : []}
            }
            return attraction
        })

        this.setState({
            uniqueTags: updatedTags,
            attractions: updatedAttractions,
            selectedAttractions: updatedAttractions,
        })
    }

    render() {
        // let allTags = this.state.attractions.flatMap(attraction => attraction.tags)
        // // console.log(allTags)
        // let uniqueTags = [...new Set(allTags)].sort()
        // this.setState({uniqueTags: uniqueTags})
        // console.log(uniqueTags)

        return (
            <div className="album py-5 bg-body-tertiary">
                <div className="container">
                    <div id="filterContainer">
                        <div className="filterButtons">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={this.handleAddModal}>
                                Add Attraction
                            </button>
                            <button
                                type="button"
                                className="btn btn btn-primary"
                                onClick={this.handleTagManger}>
                                Tag Manager
                            </button>
                        </div>
                        <div className="filterControls">
                            <SearchBar handleSearchChange={this.handleSearchChange}/>
                            <IsFreeCheckBox handleShowOnlyFreeChange={this.handleShowOnlyFreeChange}/>
                            <DropDownTags tags={this.state.uniqueTags} handleTagChange={this.handleTagChange}/>
                            <RatingDropDown handleRatingChange={this.handleRatingChange}/>
                            <SortDropDown handleSortChange={this.handleSortChange}/>
                        </div>
                    </div>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                        <AttractionsCard
                            attractions={this.state.selectedAttractions}
                            handleSaveChanges={this.handleSaveChanges}
                            handleDeleteChanges={this.handleDeleteChanges}
                            uniqueTags={this.state.uniqueTags}
                        />
                    </div>
                </div>
                {this.state.showAddModal && (
                    <AddModal
                        showAddModal={this.state.showAddModal}
                        handleAddClose={this.handleCloseAddModal}
                        allTags={this.state.uniqueTags}
                        attractions={this.state.attractions}
                        onAdd={this.handleAddAttraction}
                    />
                )}
                {this.state.showTagManger && (
                    <TagManager
                        showTagManger={this.state.showTagManger}
                        handleTagMangerClose={this.handleCloseTagManger}
                        tags={this.state.uniqueTags}
                        onAddTag={this.handleAddTag}
                        onEditTag={this.handleEditTag}
                        onDeleteTag={this.handleDeleteTag}
                    />
                )}
            </div>
        )
    }
}


class AttractionsCard extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = {
            attractions: props.attractions,
            showViewModal: false,
            showModifyModal: false,
            showAddModal: false,
        }
    }

    static getDerivedStateFromProps(props, state)
    {
        return(state.attractions !== props.attractions ? {attractions: props.attractions} : null)
    }

    handleViewModal = (attraction) =>
    {
        this.setState({selectedAttraction: attraction, showViewModal: true})
    }

    handleCloseViewModal = () =>
    {
        this.setState({selectedAttraction: null, showViewModal: false})
    }

    handleModifyModal = (attraction) =>
    {
        this.setState({selectedAttraction: attraction, showModifyModal: true})
    }

    handleCloseModifyModal = () =>
    {
        this.setState({selectedAttractions: null, showModifyModal: false})
    }


    render() {
        return (
            //https://getbootstrap.com/docs/5.3/examples/album/
            <div style={{display: "contents"}}>
                <br></br>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                    {this.state.attractions.map(attraction => (
                        <div className="col" key={attraction.id}>
                            <div className="card shadow-sm">
                                <img
                                    className="bd-placeholder-img card-img-top"
                                    width="100%"
                                    height="225"
                                    src={attraction.photosURLs[0]}
                                    alt="Attraction Thumbnail"
                                />
                                <div className="card-body">
                                    <h2>{attraction.name}</h2>
                                    <p className="card-text">{attraction.description}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => this.handleViewModal(attraction)}>
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => this.handleModifyModal(attraction)}>
                                                Edit
                                            </button>
                                        </div>
                                        <small className="text-body-secondary">{`${attraction.rating} Rating`}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {this.state.showViewModal && (
                    <ViewModal
                        attraction={this.state.selectedAttraction}
                        showViewModal={this.state.showViewModal}
                        handleViewClose={this.handleCloseViewModal}
                    />
                )}
                {this.state.showModifyModal && (
                    <ModifyModal
                        attraction={this.state.selectedAttraction}
                        showModifyModal={this.state.showModifyModal}
                        handleModifyClose={this.handleCloseModifyModal}
                        onSave={this.props.handleSaveChanges}
                        onDelete={this.props.handleDeleteChanges}
                        allTags={this.props.uniqueTags}
                    />
                )}
            </div>
        )
    }
}

class DropDownTags extends React.Component
{
    constructor(props) {
        super(props)
    }

    handleChange = e =>
    {
        this.props.handleTagChange(e.target.value)
    }

    render()
    {
        let {tags} = this.props
        let newTags = ["All Tags", "None", ...new Set(tags)]
        return(
            <select className="form-select dropdownSize" name={"tags"} onChange={this.handleChange}>
                {newTags.map((tag, index) => (
                    <option key={`${tag}-${index}`} value={tag}>{tag}</option>
                ))}
            </select>
        )
    }
}

class SearchBar extends React.Component
{
    constructor(props) {
        super(props)
    }

    handleChange = e =>
    {
        this.props.handleSearchChange(e.target.value)
    }

    render()
    {
        return(
            <form className="form">
                <button>
                    <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                        <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
                <input
                    type="text"
                    className="input"
                    placeholder="Search"
                    onChange={this.handleChange}
                />
                <button className="reset" type="reset">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </form>
        )
    }
}

class IsFreeCheckBox extends React.Component
{
    constructor(props) {
        super(props)
    }

    handleChange = e =>
    {
        this.props.handleShowOnlyFreeChange(e.target.checked)
    }

    render()
    {
        return(
            <div className="checkbox-wrapper-46">
                <input type="checkbox" id="cbx-46" className="inp-cbx" onChange={this.handleChange}/>
                <label htmlFor="cbx-46" className="cbx"
                    ><span>
                    <svg viewBox="0 0 12 10" height="10px" width="12px">
                        <polyline points="1.5 6 4.5 9 10.5 1"></polyline></svg></span
                    ><span>Free</span>
                </label>
            </div>
        )
    }
}

class RatingDropDown extends React.Component
{
    constructor(props) {
        super(props)
    }

    handleChange = e =>
    {
        this.props.handleRatingChange(e.target.value)
    }

    render()
    {
        return(
            <select className="form-select dropdownSize" onChange={this.handleChange}>
                <option value="none" disabled selected hidden>Choose Rating</option> {/*https://www.tutorialrepublic.com/faq/how-to-make-a-placeholder-for-a-select-box-in-html.php#:~:text=Answer%3A%20Use%20the%20disabled%20and,element%20that%20has%20empty%20value.*/}
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
            </select>
        )
    }
}

class SortDropDown extends React.Component
{
    constructor(props) {
        super(props)
    }

    handleChange = e =>
    {
        this.props.handleSortChange(e.target.value)
    }

    render()
    {
        return(
            <select className="form-select dropdownSize" onChange={this.handleChange}>
                <option value="none" disabled selected hidden>Sort By</option>
                <option>Name</option>
                <option>Rating</option>
            </select>
        )
    }
}


class ViewModal extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let {attraction, showViewModal, handleViewClose} = this.props

        return (
            // https://getbootstrap.com/docs/5.3/components/modal/
            <div className={`modal fade ${showViewModal ? "show" : ""}`}
                 style={{ display: showViewModal ? "block" : "none" }}
                 tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">{attraction.name}</h1>
                            <button type="button" className="btn-close" onClick={handleViewClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="carousel-container">
                                <Carousel images={attraction.photosURLs} />
                            </div>
                            <p><strong>Description:</strong> {attraction.description}</p>
                            <p><strong>Address:</strong> {attraction.address}</p>
                            <p><strong>Phone:</strong> {(attraction.phoneNumber === "" || null ? "none" : attraction.phoneNumber)}</p>{/*if no phone num display "none"*/}
                            <p><strong>Rating:</strong> {attraction.rating}</p>
                            <p><strong>Tags:</strong> {attraction.tags ? attraction.tags.join(", ") : "None"}</p>{/*add in a comma between tags, and if no tags "none"*/}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleViewClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


class Carousel extends React.Component
{
    constructor(props) {
        super(props)
    }

    render() {
        return(
            // https://getbootstrap.com/docs/4.0/components/carousel/
            <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                <ol className="carousel-indicators">
                    {/*this is for the bars at the bottom indicating the amount of images*/}
                    {this.props.images.map((image, index) => (
                        <li
                            key={index}
                            data-bs-target="#carouselExampleIndicators"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                        />
                    ))}
                </ol>
                <div className="carousel-inner">
                    {/*this is displaying the images*/}
                    {this.props.images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                            <img src={image} className="d-block w-100" alt="Attraction"/>
                        </div>
                    ))}
                </div>
                {/*buttons for switching between images*/}
                <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="sr-only"></span>
                </a>
                <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="sr-only"></span>
                </a>
            </div>
        )
    }
}


class ModifyModal extends React.Component
{
    constructor(props) {
        super(props)

        this.state = {
            name: props.attraction.name,
            description: props.attraction.description,
            address: props.attraction.address,
            phoneNumber: props.attraction.phoneNumber,
            rating: props.attraction.rating,
            tags: props.attraction.tags,
            allTags: props.allTags,
        }
    }

    handleChange = (e) =>
    {
        this.setState({[e.target.name]: e.target.value})
    }

    handleDelete = () =>
    {
        if (window.confirm("Are you sure you want to delete this attraction?")) {
            let deletedAttraction = {...this.props.attraction}
            this.props.onDelete(deletedAttraction)
            this.props.handleModifyClose()
        }
    }

    handleTagSelect = (e) =>
    {
        let selectedTag = e.target.value
        if (selectedTag && !this.state.tags.includes(selectedTag)) {
            this.setState({tags: [...this.state.tags, selectedTag]})
        }
    }

    handleTagRemove = (tagToRemove) =>
    {
        this.setState({tags: this.state.tags.filter(tag => tag !== tagToRemove)})
    }

    handleSave = () => {
        let updatedAttraction = {
            ...this.props.attraction,
            name: this.state.name,
            description: this.state.description,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            rating: parseInt(this.state.rating),
            tags: this.state.tags,
        }

        this.props.onSave(updatedAttraction)
        this.props.handleModifyClose()
    }

    render()
    {
        let {showModifyModal, handleModifyClose} = this.props
        let {name, description, address, phoneNumber, rating, tags, allTags} = this.state

        return (
            <div style={{display: "contents"}}>

                {/*https://getbootstrap.com/docs/5.3/components/modal/*/}
                <div className={`modal fade ${showModifyModal ? "show" : ""}`}
                     style={{ display: showModifyModal ? "block" : "none" }}
                     tabIndex="-1"
                     id="modifyDataModalToggle">
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="modifyDataModalToggle">Modify Attraction</h1>
                                <button type="button" className="btn-close" onClick={handleModifyClose}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    {/*https://getbootstrap.com/docs/4.0/components/input-group/*/}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Name</span>
                                        <input type="text" className="form-control" name="name" value={name} onChange={this.handleChange} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Description</span>
                                        <textarea className="form-control" name="description" value={description} onChange={this.handleChange} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Address</span>
                                        <input type="text" className="form-control" name="address" value={address} onChange={this.handleChange} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Phone</span>
                                        <input type="text" className="form-control" name="phoneNumber" value={phoneNumber} onChange={this.handleChange} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Rating</span>
                                        <input type="number" className="form-control" name="rating" value={rating} onChange={this.handleChange} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Tags</span>
                                        <select className="form-select" onChange={this.handleTagSelect}>
                                            <option value="none" disabled selected hidden>Select a Tag</option>
                                            {/*when the user selects a tag it gets added to the state*/}
                                            {allTags.map((tag, index) => (
                                                <option key={`${tag}-${index}`} value={tag}>{tag}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/*https://getbootstrap.com/docs/4.0/components/badge/*/}
                                    <div className="mb-3">
                                        <span className="input-group-text">Selected Tags:</span>
                                        <div className="d-flex flex-wrap">
                                            {/*displays the tags that the attraction has*/}
                                            {tags.map(tag => (
                                                // when clicked the tags get removed
                                                <span key={tag} className="badge bg-secondary m-1" onClick={() => this.handleTagRemove(tag)} style={{cursor: "pointer"}}>
                                                {tag} X
                                            </span>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleModifyClose}>Close</button>
                                <button type="button" className="btn btn-danger" onClick={this.handleDelete}>Delete</button>
                                <button type="button" className="btn btn-primary" onClick={this.handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


class AddModal extends React.Component
{
    constructor(props) {
        super(props)

        this.state = {
            name: "",
            description: "",
            address: "",
            phoneNumber: "",
            rating: 1,
            tags: [],
            selectedTags: [],
            photosURLs: [],
        }
    }

    componentDidMount(){
        this.setState({tags: this.props.allTags})
    }

    handleChange = (e) =>
    {
        this.setState({[e.target.name]: e.target.value})
    }

    handleTagSelect = (e) => {
        let selectedTag = e.target.value
        if (selectedTag && !this.state.selectedTags.includes(selectedTag)) {
            this.setState({selectedTags: [...this.state.selectedTags, selectedTag]})
        }
    }

    handleTagRemove = (tagToRemove) =>
    {
        this.setState({selectedTags: this.state.selectedTags.filter(tag => tag !== tagToRemove)})
    }

    handleImageChange = (e) =>
    {
        //https://www.js-craft.io/blog/using-url-createobjecturl-to-create-uploaded-image-previews-in-javascript/#:~:text=createObjectURL()%20method.,the%20URL%20is%20explicitly%20released.
        const url = window.URL.createObjectURL(e.target.files[0])
        let photos = this.state.photosURLs
        photos.push(url)
        this.setState({photosURLs: photos})
        console.log(this.state.photosURLs)
    }

    handleAddAttraction = () => {
        let length = this.props.attractions.length
        let newAttraction = {
            id: length + 1,
            name: this.state.name,
            description: this.state.description,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            rating: this.state.rating,
            tags: this.state.selectedTags,
            photosURLs: this.state.photosURLs,
            free: "yes",
        }
        this.props.onAdd(newAttraction)
        this.props.handleAddClose()
    }

    render()
    {
        let {showAddModal, handleAddClose} = this.props
        let {name, description, address, phoneNumber, rating, tags, selectedTags} = this.state

        return (
            <div className={`modal fade ${showAddModal ? "show" : ""}`}
                 style={{ display: showAddModal ? "block" : "none" }}
                 tabIndex="-1">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Add Attraction</h1>
                            <button type="button" className="btn-close" onClick={handleAddClose}></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Name</span>
                                    <input type="text" className="form-control" name="name" value={name} onChange={this.handleChange} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Description</span>
                                    <textarea className="form-control" name="description" value={description} onChange={this.handleChange} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Address</span>
                                    <input type="text" className="form-control" name="address" value={address} onChange={this.handleChange} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Phone</span>
                                    <input type="text" className="form-control" name="phoneNumber" value={phoneNumber} onChange={this.handleChange} />
                                </div>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Rating</span>
                                    <input type="number" className="form-control" name="rating" value={rating} onChange={this.handleChange} min="1" max="5" />
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text">Tags</span>
                                    <select className="form-select" onChange={this.handleTagSelect} defaultValue="">
                                        <option value="none" disabled selected hidden>Select a Tag</option>
                                        {/*when the user selects a tag it gets added to the state*/}
                                        {tags.map((tag, index) => (
                                            <option key={`${tag}-${index}`} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/*https://getbootstrap.com/docs/4.0/components/badge/*/}
                                <div className="mb-3">
                                    <span className="input-group-text">Selected Tags:</span>
                                    <div className="d-flex flex-wrap">
                                        {/*displays the tags the user added to the selectedTags state*/}
                                        {selectedTags.map(tag => (
                                            // displays the tags as a bootstrap badge when clicked they get removes from state
                                            <span key={tag} className="badge bg-secondary m-1" onClick={() => this.handleTagRemove(tag)} style={{cursor: "pointer"}}>
                                                {tag} X
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text">Images</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="camera"
                                        className="form-control"
                                        multiple
                                        onChange={this.handleImageChange}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleAddClose}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={this.handleAddAttraction}>Add Attraction</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


class TagManager extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            newTagName: "",
            selectedTag: null,
        }
    }

    handleTagSelect =(e) =>
    {
        this.setState({
            selectedTag: e.target.value,
            newTagName: this.state.selectedTag === "Add New" ? "" : this.state.selectedTag
        })
        console.log(this.state.selectedTag)
    }

    handleTagNameChange = (e) =>
    {
        this.setState({newTagName: e.target.value})
    }

    handleAddOrUpdateTag = () =>
    {
        let {newTagName, selectedTag} = this.state
        if (selectedTag === "Add New") {
            // Adding new tag
            this.props.onAddTag(newTagName)
        } else {
            // Editing existing tag
            this.props.onEditTag(selectedTag, newTagName)
        }
        this.setState({
            selectedTag: null,
            newTagName: "",})
    }

    handleDeleteTag = () => {
        if (this.state.selectedTag) {
            this.props.onDeleteTag(this.state.selectedTag)
            this.setState({
                selectedTag: null,
                newTagName: ""
            })
        }
    }

    render() {
        let {showTagManger, handleTagMangerClose, tags} = this.props
        let {selectedTag, newTagName} = this.state
        let tagOptions = ["Add New", ...new Set(tags)]

        return (
            <div style={{ display: "contents" }}>
                <div className={`modal fade ${showTagManger ? "show" : ""}`}
                     style={{ display: showTagManger ? "block" : "none" }} tabIndex="-1">
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Tag Manager</h1>
                                <button type="button" className="btn-close" onClick={handleTagMangerClose}></button>
                            </div>
                            <div className="modal-body">
                                <select className="form-select dropdownSize" onChange={this.handleTagSelect} value={selectedTag || "none"}>
                                    <option value="none" disabled selected hidden>Select a Tag</option>
                                    {tagOptions.map((tag, index) => (
                                        <option key={index} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                {selectedTag && (
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control my-2"
                                            placeholder="Enter tag name"
                                            value={newTagName || ""}
                                            onChange={this.handleTagNameChange}
                                        />
                                        {/*if user selected "add new" it has a button saying "add tag" and if the user selected one if the others it says "save changes"*/}
                                        <button className="btn btn-primary" onClick={this.handleAddOrUpdateTag}>
                                            {selectedTag === "Add New" ? "Add Tag" : "Save Changes"}
                                        </button>
                                        {/*if user selected "add new" it shows the delete button*/}
                                        {selectedTag !== "Add New" && (
                                            <button className="btn btn-danger ms-2" onClick={this.handleDeleteTag}>
                                                Delete Tag
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleTagMangerClose}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
