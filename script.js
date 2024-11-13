// TODO
//  Use only SCSS for your own code (5%)
//  Add a new attraction. You must be able add data in all fields of the attraction, including multiple images. Remember to include the free property when adding a new attraction. The Add feature must display without any other content (such as the table) showing on the webpage (10%).
//  Modify attraction. You must be able change the data in all fields of the attraction, including the images. The Modify feature must display without any other content (such as the table) showing on the webpage (10%).
//  You need to make a "tags manager" to allow the user to manage the list of available tags that can be applied to the attraction records. The tags list should be initialised when the original attractions dataset is fetched (5%)
//  The "tags manager" can be used to add new tags (5%)
//  When a tag is deleted, the tag must be deleted from all the attractions that contain it (5%)
//  When a tag is modified, the tag must be modified in all the attractions that contain it (5%)

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
        }
    }

    componentDidMount()
    {
        fetch("dublin_attractions.json")
            .then(response => response.json())
            .then(attractions => {
                let updatedAttractions = attractions.map(attraction => { //https://www.scaler.com/topics/add-property-to-object-javascript/
                    if (attraction.description.toLowerCase().includes("free"))
                    {
                        attraction.free = "yes"
                    }
                    else {
                        attraction.free = "no"
                    }
                    return attraction
                })
                this.setState({attractions: updatedAttractions, selectedAttractions: updatedAttractions})
                // console.log(updatedAttractions)
            })
    }

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
        let {attractions, selectedTag, searchQuery, showFreeOnly, minRating, sortBy} = this.state
        let filteredAttractions = attractions.filter(attraction => {
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
            filteredAttractions.sort((a, b) => b.rating - a.rating)
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
        this.setState(prevState => ({
            attractions: [...prevState.attractions, newAttraction],
            selectedAttractions: [...prevState.selectedAttractions, newAttraction],
            showAddModal: false,
        }))
    }


    handleTagManger = () =>
    {
        this.setState({showTagManger: true})
    }

    handleCloseTagManger = () =>
    {
        this.setState({showTagManger: false})
    }


    render() {
        let allTags = this.state.attractions.flatMap(attraction => attraction.tags)
        // console.log(allTags)
        let uniqueTags = ["All Tags", "None", ...new Set(allTags)].sort()
        // console.log(uniqueTags)

        return (
            <div className="album py-5 bg-body-tertiary">
                <div className="container">
                    <div id="filterContainer">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={this.handleAddModal}>
                            add
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={this.handleTagManger}>
                            Tag Manager
                        </button>
                        <DropDownTags tags={uniqueTags} handleTagChange={this.handleTagChange}/>
                        <SearchBar handleSearchChange={this.handleSearchChange}/>
                        <IsFreeCheckBox handleShowOnlyFreeChange={this.handleShowOnlyFreeChange}/>
                        <RatingDropDown handleRatingChange={this.handleRatingChange}/>
                        <SortDropDown handleSortChange={this.handleSortChange}/>
                    </div>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                        <AttractionsCard attractions={this.state.selectedAttractions} handleSaveChanges={this.handleSaveChanges} handleDeleteChanges={this.handleDeleteChanges}/>
                    </div>
                </div>
                {this.state.showAddModal && (
                    <AddModal
                        showAddModal={this.state.showAddModal}
                        handleAddClose={this.handleCloseAddModal}
                        uniqueTags={uniqueTags}
                        attractions={this.state.attractions}
                        onAdd={this.handleAddAttraction}
                    />
                )}
                {this.state.showTagManger && (
                    <TagManager
                        showTagManger={this.state.showTagManger}
                        handleTagMangerClose={this.handleCloseTagManger}
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
        return(
            <select className="form-select" name={"tags"} onChange={this.handleChange}>
                {tags.map((tag, index) => (
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
            <input
                type="text"
                placeholder="Search attractions..."
                onChange={this.handleChange}
            />
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
            <label>
                <input
                    type="checkbox"
                    onChange={this.handleChange}
                />
                Show Free Only
            </label>
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
            <select onChange={this.handleChange}>
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
            <select onChange={this.handleChange}>
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
        let { attraction, showViewModal, handleViewClose } = this.props

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
                            <p><strong>Phone:</strong> {(attraction.phoneNumber === "" || null ? "none" : attraction.phoneNumber)}</p>
                            <p><strong>Rating:</strong> {attraction.rating}</p>
                            <p><strong>Tags:</strong> {attraction.tags ? attraction.tags.join(", ") : "None"}</p>
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
        let {images} = this.props

        return(
            // https://getbootstrap.com/docs/4.0/components/carousel/
            <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                <ol className="carousel-indicators">
                    {images.map((image, index) => (
                        <li
                            key={index}
                            data-bs-target="#carouselExampleIndicators"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                        />
                    ))}
                </ol>
                <div className="carousel-inner">
                    {images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                            <img src={image} className="d-block w-100" alt="Attraction"/>
                        </div>
                    ))}
                </div>
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

        this.state =
            {
                name: props.attraction.name,
                description: props.attraction.description,
                address: props.attraction.address,
                phoneNumber: props.attraction.phoneNumber,
                rating: props.attraction.rating,
            }
    }

    handleChange = e =>
    {
        this.setState({[e.target.name]: e.target.value})
    }

    handleSave = () => {
        let updatedAttraction = {
            ...this.props.attraction,
            name: this.state.name,
            description: this.state.description,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            rating: parseInt(this.state.rating),
        }

        this.props.onSave(updatedAttraction)
        this.props.handleModifyClose()
    }

    handleDelete = () =>
    {
        if (window.confirm("Are you sure you want to delete this attraction?")) {
            let deletedAttraction = { ...this.props.attraction }
            this.props.onDelete(deletedAttraction)
            this.props.handleModifyClose()
        }
    }

    render()
    {
        let { showModifyModal, handleModifyClose } = this.props
        let { name, description, address, phoneNumber, rating } = this.state

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
                                    <div className="input-group">
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

    componentDidMount() {
        this.setState({ tags: this.props.uniqueTags || [] });
    }

    handleChange = (e) =>
    {
        this.setState({[e.target.name]: e.target.value})
    }

    handleTagSelect = (e) => {
        let selectedTag = e.target.value;
        if (selectedTag && !this.state.selectedTags.includes(selectedTag)) {
            this.setState(prevState => ({
                selectedTags: [...prevState.selectedTags, selectedTag] // Corrected here
            }));
        }
    }

    handleTagRemove = (tagToRemove) =>
    {
        this.setState(prevState => ({
            selectedTags: prevState.selectedTags.filter(tag => tag !== tagToRemove)
        }))
    }

    handleImageChange = (e) =>
    {
        let files = Array.from(e.target.files)
        let photosURLs = files.map(file => URL.createObjectURL(file))
        this.setState({ photosURLs })
    }

    handleAddAttraction = () => {
        const length = this.props.attractions.length;
        let newAttraction = {
            id: length + 1,
            name: this.state.name,
            description: this.state.description,
            address: this.state.address,
            phoneNumber: this.state.phoneNumber,
            rating: this.state.rating,
            tags: this.state.selectedTags, // Use only selected tags here
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

                                {/* Tag Selection Dropdown */}
                                <div className="input-group mb-3">
                                    <span className="input-group-text">Tags</span>
                                    <select className="form-select" onChange={this.handleTagSelect} defaultValue="">
                                        <option value="" disabled>Select a tag</option>
                                        {tags.map((tag, index) => (
                                            <option key={`${tag}-${index}`} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display Selected Tags with Remove Option */}
                                <div className="mb-3">
                                    <span className="input-group-text">Selected Tags:</span>
                                    <div className="d-flex flex-wrap">
                                        {selectedTags.map(tag => (
                                            <span key={tag} className="badge bg-secondary m-1" onClick={() => this.handleTagRemove(tag)} style={{ cursor: "pointer" }}>
                                                {tag} &times;
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group mb-3">
                                    <span className="input-group-text">Images</span>
                                    <input type="file" className="form-control" multiple onChange={this.handleImageChange} />
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
    }

    render() {
        const {showTagManger, handleTagMangerClose} = this.props;

        return (
            <div style={{display: "contents"}}>

                {/*https://getbootstrap.com/docs/5.3/components/modal/*/}
                <div className={`modal fade ${showTagManger ? "show" : ""}`}
                     style={{ display: showTagManger ? "block" : "none" }}
                     tabIndex="-1"
                     id="modifyDataModalToggle">
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="modifyDataModalToggle">Tag Manager</h1>
                                <button type="button" className="btn-close" onClick={handleTagMangerClose}></button>
                            </div>
                            <div className="modal-body">
                                Tag Manager
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
