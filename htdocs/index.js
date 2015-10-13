Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");

  Template.body.helpers({
    date : function () {
      var today = new Date();
      var year = today.getFullYear();
      var month = today.getMonth()+1;
      var week = today.getDay();
      var day = today.getDate();
      var day_of_the_week = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
      return year + "/" + month + "/" + day + " " + day_of_the_week[week];
    },
    hours: [
      { text: "09" },{ text: 10 },{ text: 11 },{ text: 12 },{ text: 13 },{ text: 14 },{ text: 15 },{ text: 16 },{ text: 17 },{ text: 18 },{ text: 19 },{ text: 20 },{ text: 21 },{ text: 22 },{ text: 23 }
    ],
    bars: [
      { text: "09" },{ text: 10 },{ text: 11 },{ text: 12 },{ text: 13 },{ text: 14 },{ text: 15 },{ text: 16 },{ text: 17 },{ text: 18 },{ text: 19 },{ teext: 20 },{ text: 21 },{ text: 22 },{ text: 23 }
    ],
    projects: [
      { text: "09" },{ text: 10 },{ text: 11 },{ text: 12 },{ text: 13 },{ text: 14 },{ text: 15 },{ text: 16 },{ text: 17 },{ text: 18 },{ text: 19 },{ text: 20 },{ text: 21 },{ text: 22 },{ text: 23 }
    ],
    tasks: function () {
      if (Session.get("hideCompleted")) {
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      var planstime = event.target.planstime.value;
      var planetime = event.target.planetime.value;
      Meteor.call("addTask", text, planstime, planetime);
      event.target.text.value = "";
      event.target.planstime.value = "";
      event.target.planetime.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text , planstime, planetime) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      planstime: planstime,
      planetime: planetime,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});
