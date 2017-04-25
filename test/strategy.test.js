/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , PLanningCenterOauth2Strategy = require('../lib/strategy');


describe('Strategy', function() {

  describe('constructed', function() {
    var strategy = new PLanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

    it('should be named planningcenter-oauth2', function() {
      expect(strategy.name).to.equal('planningcenter-oauth2');
    });
  })

  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new PLanningCenterOauth2Strategy(undefined, function(){});
      }).to.throw(Error);
    });
  })

  describe('authorization request with display parameter', function() {
    var strategy = new PLanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ scope: 'check_ins' });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://api.planningcenteronline.com/oauth/authorize?response_type=code&scope=check_ins&client_id=ABC123');
    });
  });

  describe('failure caused by user denying request', function() {
    var strategy = new PLanningCenterOauth2Strategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var info;

    before(function(done) {
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.error = 'access_denied';
          req.query.error_code = '200';
          req.query.error_description  = 'Permissions error';
          req.query.error_reason = 'user_denied';
        })
        .authenticate();
    });

    it('should fail with info', function() {
      expect(info).to.not.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });
});