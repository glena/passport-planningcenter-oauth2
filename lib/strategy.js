/**
 * Module dependencies.
 */
var util = require('util');
var OAuth2Strategy = require('passport-oauth2');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Planning Center Oauth2 authentication strategy authenticates requests by delegating to
 * Planning Center using the OAuth2 protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`        identifies client for Planning Center
 *   - `clientSecret`    client secret for the given client
 *   - `callbackURL`     URL to which Planning Center will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new PlanningCenterOauth2Strategy({
 *         clientID: '123-456-789',
 *         callbackURL: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/planningcenter/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};

  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.planningcenteronline.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.planningcenteronline.com/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);
  this._profileURL = options.profileURL || 'https://api.planningcenteronline.com/people/v2/me';
  this.name = 'planningcenter-oauth2';
  this._oauth2.useAuthorizationHeaderforGET(true);
}


// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Planning Center.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._profileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('Failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);
      var profile = json.data.attributes;

      profile.provider = 'planningcenter-oauth2';
      profile.id = json.data.id;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(new InternalOAuthError('Failed to parse user profile'));
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;