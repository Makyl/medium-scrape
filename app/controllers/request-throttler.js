
function Throttler(request){

  //Initializing variables here
  this.request = request;
  this.requestCount = 0;
  this.timeout = 0;
  this.sentRequest = 0;
  this.lastSentAt = null;
  var self = this;

  //Binding self to have access to variables and passing it down in every reQuest so it is accessible
  function requestWrapper() {
    return self.reQuest.apply(self, arguments);
  }

  //A function in the wrapper to add timeout and no of requests
  requestWrapper.config = function(){self.config.apply(self,arguments);};

  return requestWrapper;

}

Throttler.prototype.reQuest = function(){
  var self = this;
  var args = arguments;
  // Using self to be able to access the variables initialized


  //If the timeout is over, then reset the counter and lastSent
  if(Date.now() - self.lastSentAt >= self.timeout){
    self.sentRequest = 0;
    self.lastSentAt = Date.now();
  }
  //If the no of request in the timeout is less than sent, then send more
  if (self.sentRequest < self.requestCount) {
    console.log("Actual sending");
    self.sentRequest++;

    //Not binding to self here because request might be using 'this' in its code and might now work for that, but have to send args
    return self.request.apply(null, args);
  }

  //If the upper check is false, then we run the function with the delay(the delay is how much time if left for timeout);
  setTimeout(function () {
    //Binding self here because it is own function and needs to be able to access self variables
    self.reQuest.apply(self, args);
  }, self.timeout - (Date.now() - self.lastSentAt));
};

Throttler.prototype.config = function(r, t){
  var self = this;
  self.requestCount = r;
  self.timeout = t;
};


//Using constructor function
module.exports = function(request){ return new Throttler(request);};
