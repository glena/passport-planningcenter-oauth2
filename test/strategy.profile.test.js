/* global describe, it, before, expect */
/* jshint expr: true */

var PlanningCenterOauth2Strategy = require('../lib/strategy');


describe('Strategy#userProfile', function() {

  describe('fetched from default endpoint', function() {
    var strategy = new PlanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://api.planningcenteronline.com/people/v2/me') { return callback(new Error('incorrect url argument')); }
      if (accessToken != 'token') { return callback(new Error('incorrect token argument')); }

      var body = '{"data":{"type":"Person","id":"123456","attributes":{"anniversary":null,"avatar":null,"birthdate":null,"child":false,"created_at":"2017-04-19T03:42:57Z","first_name":"FirstName","gender":null,"given_name":null,"goes_by_name":null,"grade":null,"graduation_year":null,"last_name":"LastName","medical_notes":null,"membership":null,"middle_name":null,"name":"Thameera Senanayaka","nickname":null,"people_permissions":null,"remote_id":null,"school_type":null,"site_administrator":true,"status":"active","updated_at":"2017-04-19T03:42:57Z"},"links":{"addresses":"https://api.planningcenteronline.com/people/v2/people/25588869/addresses","apps":"https://api.planningcenteronline.com/people/v2/people/25588869/apps","connected_people":"https://api.planningcenteronline.com/people/v2/people/25588869/connected_people","emails":"https://api.planningcenteronline.com/people/v2/people/25588869/emails","field_data":"https://api.planningcenteronline.com/people/v2/people/25588869/field_data","household_memberships":"https://api.planningcenteronline.com/people/v2/people/25588869/household_memberships","households":"https://api.planningcenteronline.com/people/v2/people/25588869/households","inactive_reason":null,"marital_status":null,"message_groups":"https://api.planningcenteronline.com/people/v2/people/25588869/message_groups","messages":"https://api.planningcenteronline.com/people/v2/people/25588869/messages","name_prefix":null,"name_suffix":null,"person_apps":"https://api.planningcenteronline.com/people/v2/people/25588869/person_apps","phone_numbers":"https://api.planningcenteronline.com/people/v2/people/25588869/phone_numbers","school":null,"social_profiles":"https://api.planningcenteronline.com/people/v2/people/25588869/social_profiles","workflow_cards":"https://api.planningcenteronline.com/people/v2/people/25588869/workflow_cards","self":"https://api.planningcenteronline.com/people/v2/people/25588869"}},"included":[],"meta":{"can_include":["addresses","emails","field_data","households","inactive_reason","marital_status","name_prefix","name_suffix","person_apps","phone_numbers","school","social_profiles"],"parent":{"id":"225900","type":"Organization"}}}';
      callback(null, body, undefined);
    };


    var profile;

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.provider).to.equal('planningcenter-oauth2');

      expect(profile.id).to.equal('123456');
      expect(profile.first_name).to.equal('FirstName');
      expect(profile.last_name).to.equal('LastName');
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint

  describe('error caused by invalid token', function() {
    var strategy =  new PlanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"error":{"message":"Invalid OAuth access token.","type":"OAuthException","code":190,"fbtrace_id":"XxXXXxXxX0x"}}';

      callback({ statusCode: 400, data: body });
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
    });
  }); // error caused by invalid token

  describe('error caused by malformed response', function() {
    var strategy =  new PlanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };

    var err, profile;

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  }); // error caused by malformed response

  describe('internal error', function() {
    var strategy = new PlanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    }


    var err, profile;

    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error

});