var repo = require('/lib/repo');

// eslint-disable-next-line no-unused-vars
function doSuggest(tracker) {
  return {
    text: 'Are you ok with that ?',
    options: ['Yes', 'No']
  };
}

function doSearchRestaurants(tracker) {
  var slots = tracker.slots;
  var query = '';
  if (slots.price) {
    query += slots.price === 'lo' ? 'Cheap ' : 'Expensive ';
  }
  if (slots.cuisine) {
    query += slots.cuisine + ' ';
  }
  query += 'restaurant ';
  if (slots.location) {
    query += 'in ' + slots.location + ' ';
  }
  if (slots.people) {
    query += 'for ' + slots.people;
  }

  repo.saveConversationResults(tracker.sender_id, slots);

  return {
    text:
      '<a href="https://www.google.com/search?q=' +
      query +
      '">' +
      query +
      '</a>'
  };
}

module.exports = {
  action_suggest: doSuggest,
  action_search_restaurants: doSearchRestaurants
};
