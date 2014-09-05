/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var KickerAPI = require('kickerapi');
var Settings = require('settings');
var Vibe = require('ui/vibe');

Settings.config(
  { url: 'http://kicker.railslove.com/pebble_settings' },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable');
    if (e.failed) {
      console.log('user canceled', e.response);
    } else {
      console.log('new options', JSON.stringify( Settings.option() ));
      launchUI();
      Vibe.vibrate('short');
    }
  }
);

function setupMainMenu(){
  var menu = new UI.Menu();
  menu.on('select', function(e) {
    if(e.itemIndex == 0){
      loadMatches();
    }
    if(e.itemIndex == 1){
      loadRanking();
    }
  });
  return menu;
}

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

  matchWindow.ui_elements.loadingText = new UI.Text({ position: new Vector2(  32 ,  73 ), size: new Vector2(60, 32), font: 'MONO_FONT_14', text: 'Loading', textAlign: 'center' });

  matchWindow.ui_elements.placeholder_images = [];
  matchWindow.ui_elements.placeholder_images[0] = new UI.Image({ position: new Vector2( 26 , 25 ), size: new Vector2(71, 40), image: 'images/winner_team.png' });
  matchWindow.ui_elements.placeholder_images[1] = new UI.Image({ position: new Vector2( 26 , 103 ), size: new Vector2(71, 40), image: 'images/looser_team.png' });
  _.each(
    matchWindow.ui_elements.placeholder_images,
    function(element, index, list){
      matchWindow.add(element);
    }
  );

  matchWindow.ui_elements.crawling_image = new UI.Image({ position: new Vector2( 4 , 76 ), size: new Vector2(25, 16), image: 'images/crawling.png' });

  matchWindow.ui_elements.score_rect = new UI.Rect({ position: new Vector2(  32 ,  73 ), size: new Vector2(60, 22), backgroundColor: 'clear', borderColor: 'white' });
  matchWindow.add(matchWindow.ui_elements.score_rect);

  matchWindow.ui_elements.score_text = new UI.Text({ position: new Vector2(  32 ,  67 ), size: new Vector2(60, 32), font: 'gothic-24-bold', textAlign: 'center', text: '' });
  matchWindow.add(matchWindow.ui_elements.score_text);

  matchWindow.ui_elements.player_names = [];
  matchWindow.ui_elements.player_names[0] = new UI.Text({ position: new Vector2(  0 ,  -3 ), size: new Vector2(62, 25), font: 'MONO_FONT_14', textAlign: 'center', text: '' });
  matchWindow.ui_elements.player_names[1] = new UI.Text({ position: new Vector2( 62 ,  -3 ), size: new Vector2(62, 25), font: 'MONO_FONT_14', textAlign: 'center', text: '' });
  matchWindow.ui_elements.player_names[2] = new UI.Text({ position: new Vector2(  0 , 140 ), size: new Vector2(62, 25), font: 'MONO_FONT_14', textAlign: 'center', text: '' });
  matchWindow.ui_elements.player_names[3] = new UI.Text({ position: new Vector2( 62 , 140 ), size: new Vector2(62, 25), font: 'MONO_FONT_14', textAlign: 'center', text: '' });

  _.each(
    matchWindow.ui_elements.player_names,
    function(element, index, list){
      matchWindow.add(element);
    }
  );

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
    rankingWindow.active_users = _.filter( league.users(), function(element){ return element.active; } );
    if(rankingWindow.active_users.length > 0){
      rankingWindow.items(0, _.map( rankingWindow.active_users, function(user) { return { title: user.name, subtitle: user.quote }; }));
    } else {
      rankingWindow.items(0, [{ title: 'no active users' }]);
    }
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
    var body_string = user_details.number_of_wins + ' - ' + user_details.number_of_looses + '(' + user_details.percentage + ')';
    console.log(body_string);
    userDetailWindow.prop('body', body_string);
  },
  function(data, status){
    console.log('error loading user', data, status);
  });
}

function is_png(image_url){
  return image_url.indexOf('.png') > 0
}

function renderMatch(matchObj){
  matchWindow.ui_elements.player_names[0].prop('text', matchObj.winner_team[0].name);
  matchWindow.ui_elements.player_names[1].prop('text', matchObj.winner_team[1].name);
  matchWindow.ui_elements.player_names[2].prop('text', matchObj.looser_team[0].name);
  matchWindow.ui_elements.player_names[3].prop('text', matchObj.looser_team[1].name);

  matchWindow.ui_elements.score_text.prop('text', matchObj.score);

  if(matchObj.crawling){
    matchWindow.add(matchWindow.ui_elements.crawling_image);
  } else {
    matchWindow.remove(matchWindow.ui_elements.crawling_image);
  }
}

function launchUI(){
  league.init( Settings.option('league_slug') );
  matchWindow.hide();
  rankingWindow.hide();
  userDetailWindow.hide();
  mainMenu.section(0,
    {
      title: Settings.option('league_name'),
      items: [{
        title: 'Matches',
        subtitle: 'All games',
        icon: 'images/icon_allmatches.png'
      }, {
        title: 'Ranking',
        subtitle: 'How do the users rank',
        icon: 'images/icon_ranking.png'
      }]
    }
  );
  mainMenu.show();
}

console.log('Starting app with options', JSON.stringify( Settings.option() ));
var league = new KickerAPI.League();
var matchWindow = setupMatchWindow();
var rankingWindow = setupRankingWindow();
var userDetailWindow = setupUserDetailWindow();
var mainMenu = setupMainMenu();
var welcome_card = new UI.Card({title: 'Railslove Kickerapp', body: 'Open settings from the pebble app on your phone to select your league.'});

var splashScreen = new UI.Window({ fullscreen: true });
var splash_image = new UI.Image({ position: new Vector2(0, 0), size: new Vector2(144, 168), image: 'images/splash.png' });
splashScreen.add(splash_image);
splashScreen.show();

setTimeout(function() {

  if( Settings.option('league_slug') == null ) {
    welcome_card.show();
  } else {
    launchUI();
  }
  splashScreen.hide();

}, 2000);
