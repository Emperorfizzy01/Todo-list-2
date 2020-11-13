//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB',  { useNewUrlParser: true,   useUnifiedTopology: true });

const itemsSchema = {
  name: String
}

const Item = mongoose.model("item", itemsSchema);

const item1= new Item({
  name: "Welcome Home"
});

const item2= new Item({
  name: "Welcome Back"
});

const item3= new Item({
  name: "Welcome Here"
});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('list', listSchema);


app.get("/", function(req, res) {
    
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0 ) {
      Item.insertMany(defaultArray, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Successful");
        };
        res.redirect("/");
      });
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
  }); 

});

app.get("/:customName", function(req, res) {
  const customName = _.capitalize(req.params.customName);

  List.findOne({name: customName}, function(err,foundList) {
     if (!err) {
       if (!foundList) {
         //Create a new List
         const list = new List ({
          name: customName,
          items: defaultArray
        });
          list.save();
          res.redirect("/" + customName);
       } else {
        //Show Existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
       }
     }
  })

  
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item ({
    name: itemName
});

  if (listName === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
 
  
});

app.post("/delete", function(req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkItemId, function(err) {
      if(!err) {
        console.log("Success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndRemove({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList) {
      if (!err) {
      res.redirect("/" + listName);
      };
    });
    }
  });



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
