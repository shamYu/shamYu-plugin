/**
 * author : 刘宇阳
 * date : 2015-01-02
 * desc : 基于render的工厂js
 */
(function ($, render) {
    var util = render.util;
    util.ensure(render, 'factory', function () {
        var map = {};
        return function (name, fun) {
            if (!name) return null;
            if (name && !fun) return map[name];
            var obj = fun;
            if ($.isFunction(fun)) obj = fun();
            return (map[name] = obj);
        };
    });
})(jQuery, render);
/**
 * 常用的factory
 */
(function ($, render) {
    /*兼容ie8 bind方案*/
    if(!Function.prototype.bind){
        Function.prototype.bind = function(obj){
            var _self = this, args = arguments;
            return function() {
                _self.apply(obj, Array.prototype.slice.call(args, 1));
            }
        }
    }
    /*promise*/
    render.factory('Promise', function () {
        var Promise = function (startFunc) {
            this.state = 'pending';
            this.thenables = []; //存储接下来的步骤
            if (startFunc && typeof startFunc === 'function') {
                startFunc(this.resolve, this.reject);
            }
        };
        /**
         * 改变状态为已完成
         * @param  {[type]} value 传递的值
         * @return {[type]}       [description]
         */
        Promise.prototype.resolve = function (value) {
            if (this.state != 'pending') return;
            this.state = 'fulfilled';
            this.value = value;
            this._handleThen();
            return this;
        };
        /**
         * 改变状态为有异常
         * @param  {[type]} reason [description]
         * @return {[type]}        [description]
         */
        Promise.prototype.reject = function (reason) {
            if (this.state != 'pending') return;
            this.state = 'rejected';
            this.reason = reason;
            this._handleThen();
            return this;
        };
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var thenable = {};
            if (typeof onFulfilled == 'function') {
                thenable.fulfill = onFulfilled;
            }
            if (typeof onRejected == 'function') {
                thenable.reject = onRejected;
            }
            /**
             * 如果状态不是pending就立即执行
             */
            if (this.state != 'pending') {
                if (window.setImmediate) {
                    setImmediate(function () {
                        this._handleThen();
                    }.bind(this));
                } else {
                    setTimeout(function () {
                        this._handleThen();
                    }.bind(this), 0);
                }
            }
            thenable.promise = new Promise();
            this.thenables.push(thenable);
            return thenable.promise;
        };
        Promise.prototype._handleThen = function () {
            if (this.state === 'pending') return;
            if (this.thenables.length) {
                for (var i = 0; i < this.thenables.length; i++) {
                    var thenPromise = this.thenables[i].promise;
                    var returnedVal;
                    try {
                        switch (this.state) {
                            case 'fulfilled':
                                if (this.thenables[i].fulfill) {
                                    returnedVal = this.thenables[i].fulfill(this.value);
                                } else {
                                    thenPromise.resolve(this.value);
                                }
                                break;
                            case 'rejected':
                                if (this.thenables[i].reject) {
                                    returnedVal = this.thenables[i].reject(this.reason);
                                } else {
                                    thenPromise.reject(this.reason);
                                }
                                break;
                        }
                        if (returnedVal === undefined || returnedVal === null) {
                            this.thenables[i].promise.resolve(this.value);
                            /*判断返回值是否是Promise对象，如果值那么下个promise执行要绑定在返回值的then方法上*/
                        } else if (returnedVal instanceof Promise || typeof returnedVal.then === 'function') {
                            returnedVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise));
                        } else {
                            this.thenables[i].promise.resolve(returnedVal);
                        }
                    } catch (e) {
                        thenPromise.reject(e);
                    }
                }
                this.thenables = [];
            }
        };
        return Promise;
    });
    /*cache*/
    render.factory('Cache', function () {
        function Cache(limit) {
            this.size = 0;
            this.limit = limit;
            this.head = this.tail = undefined;
            this._keymap = {};
        }

        Cache.prototype.put = function (key, value) {
            var entry = {
                key: key,
                value: value
            };
            this._keymap[key] = entry;
            if (this.tail) {
                this.tail.newer = entry;
                entry.older = this.tail;
            } else {
                this.head = entry;
            }
            this.tail = entry;
            if (this.size === this.limit) {
                return this.shift();
            } else {
                this.size++;
            }
        };
        Cache.prototype.shift = function () {
            var entry = this.head;
            if (entry) {
                this.head = this.head.newer;
                this.head.older = undefined;
                entry.newer = entry.older = undefined;
                this._keymap[entry.key] = undefined;
            }
            return entry;
        };
        Cache.prototype.get = function (key, returnEntry) {
            var entry = this._keymap[key];
            if (entry === undefined) return;
            if (entry === this.tail) {
                return returnEntry ? entry : entry.value;
            }
            if (entry.newer) {
                if (entry === this.head) {
                    this.head = entry.newer;
                }
                entry.newer.older = entry.older; // C <-- E.
            }
            if (entry.older) {
                entry.older.newer = entry.newer; // C. --> E
            }
            entry.newer = undefined; // D --x
            entry.older = this.tail; // D. --> E
            if (this.tail) {
                this.tail.newer = entry; // E. <-- D
            }
            this.tail = entry;
            return returnEntry ? entry : entry.value;
        };
        return Cache;
    });
})(jQuery, render);