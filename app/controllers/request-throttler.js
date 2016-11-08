
function Throttler(request){
  this.request = request;
  this.requestCount = 0;
  this.timeout = 0;
  this.sentRequest = 0;
  this.lastSentAt = null;
  var self = this;

  function requestWrapper() {
    return self.reQuest.apply(self, arguments);
  }

  requestWrapper.config = function(){self.config.apply(self,arguments);};

  return requestWrapper;

}

Throttler.prototype.reQuest = function(){
  var self = this;
  var args = arguments;

  if(Date.now() - self.lastSentAt >= self.timeout){
    self.sentRequest = 0;
    self.lastSentAt = Date.now();
  }

  if (self.sentRequest < self.requestCount) {
    console.log("Actual sending")
    self.sentRequest++;
    return this.request.apply(null, args);
  }
  setTimeout(function () {
    self.reQuest.apply(self, args);
  }, self.timeout - (Date.now() - self.lastSentAt));
};

Throttler.prototype.config = function(r, t){
  var self = this;
  self.requestCount = r;
  self.timeout = t;
};



module.exports = function(request){ return new Throttler(request);};
