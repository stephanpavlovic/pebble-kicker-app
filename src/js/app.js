/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var KickerAPI = require('kickerapi');


function setupMatchWindow(){
  var matchWindow = new UI.Window({
    fullscreen: true,
    action: {
      up: 'images/action_icon_up.png',
      down: 'images/action_icon_down.png',
      select: 'images/action_icon_reload.png'
    }
  });
  //144 x 168

  matchWindow.ui_elements = {};

  matchWindow.ui_elements.loadingText = new UI.Text({ position: new Vector2(  0 ,  66 ), size: new Vector2(144, 32), font: 'gothic-24-bold', text: 'Loading...', textAlign: 'center' });

  matchWindow.ui_elements.placeholder_images = [];
  matchWindow.ui_elements.placeholder_images[0] = new UI.Image({ position: new Vector2( 0  , 5   ), size: new Vector2(60, 60), image: 'images/default_user.png' });
  matchWindow.ui_elements.placeholder_images[1] = new UI.Image({ position: new Vector2( 64 , 5   ), size: new Vector2(60, 60), image: 'images/default_user.png' });
  matchWindow.ui_elements.placeholder_images[2] = new UI.Image({ position: new Vector2( 0  , 100 ), size: new Vector2(60, 60), image: 'images/default_user.png' });
  matchWindow.ui_elements.placeholder_images[3] = new UI.Image({ position: new Vector2( 64 , 100 ), size: new Vector2(60, 60), image: 'images/default_user.png' });
  _.each(
    matchWindow.ui_elements.placeholder_images,
    function(element, index, list){
      matchWindow.add(element);
    }
  );

  matchWindow.ui_elements.score_rect = new UI.Rect({ position: new Vector2(  37 ,  72 ), size: new Vector2(70, 22), backgroundColor: 'clear', borderColor: 'white' });
  matchWindow.add(matchWindow.ui_elements.score_rect);

  matchWindow.ui_elements.player_names = [];
  matchWindow.ui_elements.player_images = [];

  matchWindow.currentMatchIndex = 0; //start with latest match
  matchWindow.on('click', 'up', function() {
    if(league.matches()) {
      matchWindow.currentMatchIndex--;
      if(matchWindow.currentMatchIndex < 0) { matchWindow.currentMatchIndex = 0 }
      renderMatch(league.matches()[matchWindow.currentMatchIndex]);
    }
  });

  matchWindow.on('click', 'down', function() {
    if(league.matches()) {
      matchWindow.currentMatchIndex++;
      if(matchWindow.currentMatchIndex > league.matches().length) { matchWindow.currentMatchIndex = league.matches().length-1 }
      renderMatch(league.matches()[matchWindow.currentMatchIndex]);
    }
  });

  matchWindow.on('click', 'select', function() {
    loadMatches();
  });

  return matchWindow;
}

function setupRankingWindow(){
  var menu = new UI.Menu({
    sections: [{
      title: 'Ranking',
      items: [{
        title: 'Loading...'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected' + e.itemIndex);
    console.log(rankingWindow.active_users[e.itemIndex].id)
    loadUserDetails(rankingWindow.active_users[e.itemIndex].id);
  });
  return menu;
}

function setupUserDetailWindow(){
  var card = new UI.Card({});
  return card;
}

var league = new KickerAPI.League('railslove');
var matchWindow = setupMatchWindow();
var rankingWindow = setupRankingWindow();
var userDetailWindow = setupUserDetailWindow();

function loadMatches(){
  matchWindow.add(matchWindow.ui_elements.loadingText);
  matchWindow.currentMatchIndex = 0;
  matchWindow.show();
  league.loadMatches(function(){
    matchWindow.remove(matchWindow.ui_elements.loadingText);
    renderMatch(league.matches()[0]);
  },
  function(data, status){
    console.log('error loading matches', data, status);
  });
}

function loadRanking(){
  rankingWindow.show();
  league.loadUsers(function(){
    console.log(league.users());
    rankingWindow.active_users = _.filter( league.users(), function(element){ return element.active; } );
    rankingWindow.items(0, _.map( rankingWindow.active_users, function(user) { return { title: user.name, subtitle: user.quote }; }));
  },
  function(data, status){
    console.log('error loading users', data, status);
  });
}

function loadUserDetails(id){
  userDetailWindow.show();
  league.loadUserDetails(id, function(user_details){
    console.log(user_details.name);
    userDetailWindow.prop('subtitle', user_details.quote + '');
    userDetailWindow.prop('title', user_details.name);
    var body_string = user_details.number_of_wins + ' - ' user_details.number_of_looses + '(' + user_details.percentage + ')';
    console.log(body_string);
    userDetailWindow.prop('body', body_string);
    if(is_png(user_details.image)){
      userDetailWindow.prop('icon', user_details.image);
    }
    else{
      userDetailWindow.prop('icon', 'images/default_user.png')
    }
  },
  function(data, status){
    console.log('error loading user', data, status);
  });
}

function renderMenu(){
  var menu = new UI.Menu({
    sections: [{
      title: 'Railslove Kickerapp',
      items: [{
        title: 'Matches',
        subtitle: 'All games'
      }, {
        title: 'Ranking',
        subtitle: 'How do the users rank'
      }]
    }]
  });
  menu.show()
  menu.on('select', function(e) {
    if(e.itemIndex == 0){
      loadMatches();
    }
    if(e.itemIndex == 1){
      loadRanking();
    }
  });
}

function is_png(image_url){
  return image_url.indexOf('.png') > 0
}

function renderMatch(matchObj){
  _.each(
    matchWindow.ui_elements.player_images,
    function(element, index, list){
      matchWindow.remove(element);
    }
  );

  if(is_png(matchObj.winner_team[0].image)){
    matchWindow.ui_elements.player_images[0] = new UI.Image({ position: new Vector2( 0  , 5   ), size: new Vector2(60, 60), image: matchObj.winner_team[0].image });
    matchWindow.add(matchWindow.ui_elements.player_images[0]);
  }
  if(is_png(matchObj.winner_team[1].image)){
    matchWindow.ui_elements.player_images[1] = new UI.Image({ position: new Vector2( 64 , 5   ), size: new Vector2(60, 60), image: matchObj.winner_team[1].image });
    matchWindow.add(matchWindow.ui_elements.player_images[1]);
  }
  if(is_png(matchObj.looser_team[0].image)){
    matchWindow.ui_elements.player_images[2] = new UI.Image({ position: new Vector2( 0  , 100 ), size: new Vector2(60, 60), image: matchObj.looser_team[0].image });
    matchWindow.add(matchWindow.ui_elements.player_images[2]);
  }
  if(is_png(matchObj.looser_team[1].image)){
    matchWindow.ui_elements.player_images[3] = new UI.Image({ position: new Vector2( 64 , 100 ), size: new Vector2(60, 60), image: matchObj.looser_team[1].image });
    matchWindow.add(matchWindow.ui_elements.player_images[3]);
  }

  _.each(
    matchWindow.ui_elements.player_names,
    function(element, index, list){
      matchWindow.remove(element);
    }
  );

  matchWindow.remove(matchWindow.ui_elements.score_text);

  matchWindow.ui_elements.player_names[0] = new UI.Text({ position: new Vector2(  0 ,   15 ), size: new Vector2(60, 60), font: 'gothic-24-bold', text: matchObj.winner_team[0].short_name, textAlign: 'center' });
  matchWindow.ui_elements.player_names[1] = new UI.Text({ position: new Vector2( 64 ,   15 ), size: new Vector2(60, 60), font: 'gothic-24-bold', text: matchObj.winner_team[1].short_name, textAlign: 'center' });
  matchWindow.ui_elements.player_names[2] = new UI.Text({ position: new Vector2(  0 , 110 ), size: new Vector2(60, 60), font: 'gothic-24-bold', text: matchObj.looser_team[0].short_name, textAlign: 'center' });
  matchWindow.ui_elements.player_names[3] = new UI.Text({ position: new Vector2( 64 , 110 ), size: new Vector2(60, 60), font: 'gothic-24-bold', text: matchObj.looser_team[1].short_name, textAlign: 'center' });

  matchWindow.ui_elements.score_text = new UI.Text({ position: new Vector2(  0 ,  66 ), size: new Vector2(144, 32), font: 'gothic-24-bold', text: matchObj.score, textAlign: 'center' });
  matchWindow.add(matchWindow.ui_elements.score_text);

  _.each(
    matchWindow.ui_elements.player_names,
    function(element, index, list){
      matchWindow.add(element);
    }
  );
}

renderMenu();
