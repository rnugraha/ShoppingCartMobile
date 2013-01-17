//
// A demo of simple Shopping Basket application
// using combination of Backbone and jQuery-UI Mobile.
//
// User: rnugraha
// Date: 1/5/13
// Time: 8:20 PM
//




// Product Category
// ----------------

// Category model
var Category = Backbone.Model.extend({});

// Category collection
var CategoryCollection = Backbone.Collection.extend({
	// use Category model
	model: Category,
	// comparator to determine the sort order based on the **category_id**
	comparator: function (category)
	{
		return category.get("category_id");
	}
});

// Single Category View
var CategoryView = Backbone.View.extend({

	tagName: 'li',

	// HTML template for each category
	template: $('#prod-cat-tmpl').template(),

	appRouter: null,

	// initialization
	initialize: function () {

		// set appRouter
		this.appRouter = this.options.appRouter;

		// bind customized method
		_.bindAll(this, "setDetailsViewModel");

		// attach view as data to its element
		// so that later we can retrieve all
		// associated attributes of this view when we
		// want to do further processing to this view
		$(this.el).data("item-view", this.model);

	},

	// bind event when user click me
	events: {
		"click a": "setDetailsViewModel"
	},

	// set model for Details View
	setDetailsViewModel: function () {
		this.appRouter.detailsModel = this.model;
	},

	// render Category view
	render: function() {
		// render template with associated model
		$.tmpl(this.template, this.model).appendTo(this.el);
		return this;
	}
});

// Category View List
var CategoryListView = Backbone.View.extend({
	// bind categories to <code>#categories</code>
	// element in the HTML
	el: '#categories',

	// HTML template for each category
	template: $('#prod-cat-tmpl').template(),

	appRouter: null,

	initialize: function() {
		// set appRouter
		this.appRouter = this.options.appRouter;
		// bind customized method to this view
		_.bindAll(this, "renderItem");
	},

	// render a single product item based on
	// associated model and append it to the
	// main element
	renderItem: function(model){
		var catView = new CategoryView({model: model, appRouter: this.appRouter});
		catView.render();
		$(this.el).append(catView.el);
	},

	// render Category view
	render: function(){
		// render each associated category model based on the template
		// and then append it to the main element
		this.collection.each(this.renderItem);

		// refresh list view to re-apply jQuery Mobile styling
		$(this.el).listview("refresh");

		return this;
	}
});


// Product Item
// ------------

// Product Item model
var Item = Backbone.Model.extend({});

// Product Item collection
var ItemCollection = Backbone.Collection.extend({
	// use Item model
	model: Item,

	// comparator to determine the sort order based on the **product_id**
	comparator: function (product)
	{
		return product.get("product_id");
	}
});

// A single product item view
// use default element (**div**)
var ItemView = Backbone.View.extend({

	tagName: 'li',

	// HTML template for each product item
	template: $('#prod-item-tmpl').template(),

	appRouter: null,

	// initialization
	initialize: function () {
		// set appRouter for this view
		this.appRouter = this.options.appRouter;
		// bind all customized functions
		_.bindAll(this, "showItemPopup");
	},

	// bind events
	events: {
		"click #buyItemBtn": "showItemPopup"
	},

	// display popup
	showItemPopup: function() {
		// create new popup instance based on associated model
		var buyPopup = new ItemPopUpView({model: this.model, appRouter: this.appRouter});
		buyPopup.render();
	},

	// render Item view
	render: function() {
		// render template with associated model
		var html = $.tmpl(this.template, this.model);

		//then append it to view element
		$(this.el).append(html);
		return this;
	}
});

// Product item collection
var ItemViewList = Backbone.View.extend({
	// main element to be bind to
	el: '#productList',

	appRouter: null,

	// initialization
	initialize: function(){
		// set appRouter for this View
		this.appRouter = this.options.appRouter;

		// bind customized method to this view
		_.bindAll(this, "renderItem", "isContainerEmpty");
	},

	// check if container is empty
	isContainerEmpty: function() {
		return $(this.el).children().length > 0 ? false : true;
	},

	// render a single product item based on
	// associated model and append it to the
	// main element
	renderItem: function(model){
		// initiate item view with its model
		var itemView = new ItemView({model: model, appRouter: this.appRouter});
		// render it
		itemView.render();
		// and append it to the main element
		$(this.el).append(itemView.el);
	},

	// render the collection of product items
	render: function() {
		// first check if container is empty or not
		if (!this.isContainerEmpty()) {
			//if yes then empty it
			$(this.el).empty();
		}

		// just populate the items from selected category
		this.collection.each(this.renderItem);
		// refresh list view to re-apply jQuery Mobile styling
		$(this.el).listview("refresh");
	}
});


// Item pop up view
// confirmation pop up if user wants to buy selected item or not
var ItemPopUpView = Backbone.View.extend({

	// element definition
	el: '#purchase',

	// get template
	template:  $('#prod-item-popup-tmpl').template(),

	appRouter: null,

	initialize: function () {
		this.appRouter = this.options.appRouter;
		_.bindAll(this, "buyItem")
	},

	events: {
		"click .buy-item-btn": "buyItem"
	},

	// add selected item user wants to buy to basket collection
	buyItem: function() {

		// insert selected item's clone to the basket collection
		this.appRouter.basketItems.add(this.model.clone());
		// log it
		console.log('add ' + this.model.get('album') + ' to basket');
		// remove event binding to prevent Zombie view
		this.undelegateEvents();
	},

	// rendering View
	render: function() {
		$(this.el).html($.tmpl(this.template, this.model));
		// re-create element to apply styling
		$(this.el).trigger('create');
	}

});

// Order
// -----

// Order item collection that
// will store selected product item
var OrderItems = Backbone.Collection.extend({
	// user Item model
	model: Item,

	// initialization
	initialize: function () {
		// bind customized method to this view
		_.bindAll(this, "totalPrice");
	},

	// calculate total price
	totalPrice: function () {
		// underscore.js's **reduce** function is used
		return this.reduce(function(memo, value) { return memo + value.get("price") }, 0);
	}
});

// Representation of a single
// selected product in the basket
var OrderItemView = Backbone.View.extend({
	// use HTML element **tr**
	tagName: 'tr',

	// HTML template for single ordered product item
	template: $('#order-item-tmpl').template(),

	// bind click event to customized method
	events: {
		"click #remove-item-btn"   : "removeItem"
	},

	// initialization
	initialize: function (options) {
		_.bindAll(this, "removeItem");
	},

	// remove a selected product item
	removeItem: function () {
		// will destroy associated model from ordered product item collection
		this.model.destroy();
	},

	// render this view
	render: function() {

		// generate element id
		// based on **category**, **product_id**, and model's **cid**
		var _id = 'order_item_' + this.model.get('category') + '_' + this.model.get('product_id') + '_' +  this.model.cid;

		// render associated model using template and then append it to the
		// parent's element
		$(this.el).append($.tmpl(this.template, this.model));

		// set element's id with the generated id
		$(this.el).attr('id', _id);

		return this;
	}
});


// Container view for list of order item view
// or we can call this simply shopping basket view
var OrderItemViewList = Backbone.View.extend({
	// define HTML element destination
	el: $("#order-items"),

	// totalPriceTemplate
	totalPriceTmpl: $('#total-price-tmpl').template(),

	appRouter: null,

	// this view has total price view
	// totalView: null,

	// initialization
	initialize: function () {

		// set app router
		this.appRouter = this.options.appRouter;

		// bind all customized functions to this view
		_.bindAll(this, "render","removeItem","emptyBasket","renderItem", "refreshTotalPrice");

		// bind this collection events to customized functions
		this.collection.bind("remove", this.removeItem);
		this.collection.bind("reset", this.emptyBasket);
	},

	refreshTotalPrice: function() {
		$('.tbl-price-total-row').remove();
		// finally add Total Price
		var _totalPrice = this.appRouter.basketItems.totalPrice()
		// render total price template
		var _totalHTML = $.tmpl(this.totalPriceTmpl, {totalPrice: _totalPrice});
		$(this.el).append(_totalHTML);
	},

	// empty basket view
	emptyBasket: function() {
		// first empty all rows
		$(this.el).empty();
		// then refresh total price
		this.refreshTotalPrice();
	},

	// when an item is removed from the basket
	removeItem: function(item) {
		// let's find out which one is going to be removed by generate element id
		var _id = 'order_item_' + item.get('category') + '_' + item.get('product_id') + '_' + item.cid;

		// remove element from the screen
		$('#'+ _id).remove();

		// then refresh total price
		this.refreshTotalPrice();
	},

	// render a single product item based on
	// associated model and append it to the
	// main element
	renderItem: function(model){
		// create new instance of single order item view
		var orderItemView = new OrderItemView({model: model, parent: this});
		orderItemView.render();
		// append it to this element
		$(this.el).append(orderItemView.el);
		// re-create element to reapply styling
		$(this.el).trigger('create');
	},

	// render the view
	render: function () {
		// first empty the container
		$(this.el).empty();
		// for each selected items in the collection, lets render them
		this.collection.each(this.renderItem);
		this.refreshTotalPrice();
	}


});

// Details View
// -------------
var DetailsView = Backbone.View.extend({

	// element of details view
	el: $('#details'),

	appRouter: null,

	initialize: function () {
		// set appRouter
		this.appRouter = this.options.appRouter;
	},

	// render view
	render: function () {
		var _this = this;

		// define new collection for product items
		var items = new ItemCollection;

		// get collection of product item from
		// JSON data based on selected category
		items.url =  "data/" + this.model.get('value') + "_data.json";

		// fetch it synchronously
		items.fetch({
			async: false,
			success: function() {
				// now, let's create the View for the product items
				// and render it
				var itemViewList = new ItemViewList({collection: items, appRouter: _this.appRouter});
				itemViewList.render();
			},
			error: function() {
				// clean up
				$("#productList").empty();
				// display error text
				$("#productList").append('<li><p class="noProductTxt">Products is not available</p></li>');
				// reapply styling
				$(this.el).listview("refresh");
				// log
				console.log('Data is not available');
			}
		});

	}
});


// Buttons
// -------

// Basket Button
var BasketButton = Backbone.View.extend({
	// get template
	template:  $('#basket-btn-tmpl').template(),

	appRouter: null,

	initialize: function() {
		// set appRouter
		this.appRouter = this.options.appRouter;
	},

	render : function () {
		// get total price
		var totalPrice = this.appRouter.basketItems.totalPrice();
 	    // clean up
		$('#' + this.el.id + ' #basket-btn').remove();
		// and finally render this view
		$(this.el).append($.tmpl(this.template, {price:totalPrice}));
	}
});


// Submit Button
var SubmitButton = Backbone.View.extend({
	el: '.basket-footer',

	//get template
	template:  $('#submit-btn-tmpl').template(),

	appRouter: null,

	initialize: function() {
		// set appRouter
		this.appRouter = this.options.appRouter;
	},

	render : function () {

		var totalPrice = 0

		// get total price
		if (this.appRouter.basketItems.length > 0) totalPrice = this.appRouter.basketItems.totalPrice();

		// clean up
		$('#submit-btn').remove();

		// and finally render this view with total price
		$(this.el).append($.tmpl(this.template, {price:totalPrice}));
	}
});

// Reset Button
var ResetButton = Backbone.View.extend({
	el: '.basket-footer',

	// get template
	template:  $('#reset-btn-tmpl').template(),

	appRouter: null,

	// bind event
	events: {
		"click #reset-btn": "resetBasket"
	},

	initialize: function() {
		_.bindAll(this, "resetBasket");
		this.appRouter = this.options.appRouter;
	},

	resetBasket: function() {
		console.log('reset basket ...');

		// reset basket collection
		this.appRouter.basketItems.reset();

		// remove event binding to prevent Zombie view
		this.undelegateEvents();
	},
	render : function () {
		$('#reset-btn').remove();  //cleanup
		// render this view
		$(this.el).append($.tmpl(this.template));
	}
});


// Home View
// -------------

var HomeView = Backbone.View.extend({

	// parent router
	appRouter: null,

	// product categories
	cat_data: null,
	cat_items: null,
	cat_view: null,

	initialize: function () {
		// define this as local variable
		// so it's accessible in the lower
		// functions
		var homeView = this;

		this.appRouter = this.options.appRouter;

		// retrieve product category list
		// from JSON file
		$.ajax({
			url: "data/ProductCategories_data.json",
			dataType: 'json',
			data: {},
			async: false,

			// when product category list is successfully retrieved
			success: function (data)
			{
				// build category list
				homeView.cat_data = data;
				homeView.cat_items = new CategoryCollection(data);

				homeView.cat_view = new CategoryListView({ collection: homeView.cat_items, appRouter: homeView.appRouter });
				homeView.cat_view.render();
			}
		});
	}

});


// Main App Router

var AppRouter = Backbone.Router.extend({


	// home page elements
	homeView: null,
	basketBtn: null,

	// details page elements
	detailsModel: null,
	detailsView: null,

	// basket page elements
	basketItems: null,
	basketView: null,
	submitBtn: null,
	resetBtn: null,

	// define the routes
	routes:{
		"":"home",
		"details": "details",
		"basket":"basket"
	},

	initialize: function () {

		_.bindAll(this, "createBasketButtons")

		// Handle back button throughout the application
		$('.back').live('click', function(event) {
			window.history.back();
			return false;
		});

		// initialize user's order
		this.basketItems = new OrderItems;
	},

	home: function () {
		console.log('#home');
		// populate category view when homepage is empty
		if ($('#categories').children().length == 0) {
			this.homeView = new HomeView({appRouter : this});
		}
		// render basket button
		this.basketBtn = new BasketButton ({el:'#home-header', appRouter:this});
		this.basketBtn.render();

		// trigger create to reapply styling
		$('#home').trigger('create');
	},

	details: function () {
		console.log('#details');
		// render details view with associated details model
		this.detailsView = new DetailsView ({model: this.detailsModel, appRouter : this});
		this.detailsView.render();

		// render basket button
		this.basketBtn = new BasketButton ({el:'#details-header', appRouter:this});
		this.basketBtn.render();

		// trigger create to reapply styling
		$('#details').trigger('create');
	},

	basket: function () {
		console.log(this.basketItems.toJSON());
		// render basket view with order item collection
		this.basketView = new OrderItemViewList ({collection:this.basketItems, appRouter:this});
		this.basketView.render();

		// create basket buttons
		this.createBasketButtons();

		// trigger create to reapply styling
		$('#basket').trigger('create');
	},

	createBasketButtons: function () {
		// first .. clean up
		$('.basket-footer').empty();

		// render reset button
		this.resetBtn = new ResetButton ({appRouter:this});
		this.resetBtn.render();

		// render submit button
		this.submitBtn = new SubmitButton ({appRouter:this});
		this.submitBtn.render();
	}

});

$(document).ready(function () {
	console.info('document is ready');
	// create instance
	app = new AppRouter();
	// start the history
	Backbone.history.start();
});

