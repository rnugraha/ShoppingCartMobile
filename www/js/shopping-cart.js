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
$(function(){


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

	// Category view
	var CategoryView = Backbone.View.extend({
		// bind categories to <code>#categories</code>
		// element in the HTML
		el: $('#categories'),
		// HTML template for each category
		template: $('#prod-cat-tmpl').template(),

		initialize: function() {
			_.bindAll(this)
		},

		// render Category view
		render: function(){

			// render each associated category model based on the template
			// and then append it to the main element
			$.tmpl(this.template, this.model.toArray()).appendTo(this.el);
			// refresh list view to re-apply jQuery Mobile styling
			$(this.el).listview("refresh");

			return this;
		}
	});


	// Main App View
	// -------------

	var AppView = Backbone.View.extend({

		// product categories
		cat_data: null,
		cat_items: null,
		cat_view: null,

		initialize: function () {
			// define this as local variable
			// so it's accessible in the lower
			// functions
			var appView = this;

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
					appView.cat_data = data;
					appView.cat_items = new CategoryCollection(data);

					console.log(appView.cat_items.toJSON());

					appView.cat_view = new CategoryView({ model: appView.cat_items });
					appView.cat_view.render();

				}
			});

			console.log('im here');
		}
	});

	// Finally, we kick every things off by creating the App.
	var appView = new AppView;

});
