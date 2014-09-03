var ajax = require('ajax');

var API_URL = 'http://kicker.railslove.com/'

var League = function(name) {

};

League.prototype.loadMatches = function(success, failure) {
  console.log('loading matches from api...');
  var _this = this;
  ajax({ url: API_URL+this._name+'.json', type: 'json' },
    function(data, status) {
      console.log('loaded matches: ', data);
      if (data instanceof Array) {
        _this._matches = data;
        success();
      } else {
        failure(data, status);
      }
    },
    function(data, status){
      failure(data, status);
    }
  );
};

League.prototype.loadUsers = function(success, failure) {
  console.log('loading users from api...');
  var _this = this;
  ajax({ url: API_URL+this._name+'/users.json', type: 'json' },
    function(data, status) {
      console.log('loaded users: ', data);
      if (data instanceof Array) {
        _this._users = data;
        success();
      } else {
        failure(data, status);
      }
    },
    function(data, status){
      failure(data, status);
    }
  );
};

League.prototype.loadUserDetails = function(id, success, failure) {
  console.log(id, 'loading user details from api...');
  var _this = this;
  ajax({ url: API_URL+this._name+'/users/' + id + '.json', type: 'json' },
    function(data, status) {
      console.log('loaded user details: ', data.name);
      _this._active_user = data;
      success(data);
    },
    function(data, status){
      failure(data, status);
    }
  );
};

League.prototype.init = function(new_name) {
  this._name = new_name;
  this._matches = [];
  this._users = [];
  this._active_user = {};
};

League.prototype.matches = function() {
  return this._matches;
};

League.prototype.users = function() {
  return this._users;
};

League.prototype.active_user = function() {
  return this._active_user;
};

module.exports = League;
