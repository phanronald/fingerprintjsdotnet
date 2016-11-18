//A typescript implementation of a generic Collection
var Collection = (function () {
    function Collection() {
        var _this = this;
        // The underlying array data structure of the collection
        this._items = [];
        // Add an object to the collection
        this.Add = function (item) {
            _this._items.push(item);
        };
        this.AddRange = function (items) {
            (_a = _this._items).push.apply(_a, items);
            var _a;
        };
        this.Aggregate = function (callbackfun, initialValue) {
            return _this._items.reduce(callbackfun, initialValue);
        };
        this.Any = function (expression) {
            return expression === undefined ? _this._items.length > 0 : _this._items.some(expression);
        };
        this.Clear = function () {
            _this._items = [];
        };
        this.Concat = function (second) {
            var newConcatArray = _this._items.concat(second.ToArray());
            return _this.ConvertArrayToCollection(newConcatArray);
        };
        this.Contains = function (item) {
            return _this._items.some(function (x) { return x === item; });
        };
        // Length of the collection
        this.Count = function (expression) {
            return expression === undefined ? _this._items.length : _this.Where(expression).Count();
        };
        this.Distinct = function () {
            return _this.Where(function (value, index, iter) { return iter.indexOf(value) === index; });
        };
        // Get a specific item from a collection given it's index
        this.ElementAt = function (index) {
            return _this._items[index];
        };
        this.ElementAtOrDefault = function (index) {
            if (_this.Count() == 0) {
                return undefined;
            }
            return _this.ElementAt(index) || undefined;
        };
        this.First = function (expression) {
            return expression === undefined ? _this._items[0] : _this.Where(expression)[0];
        };
        this.FirstOrDefault = function (expression) {
            if (_this.Count() <= 0) {
                return undefined;
            }
            var firstWithExpression = _this.First(expression);
            return (firstWithExpression === undefined ? undefined : firstWithExpression);
        };
        this.GroupBy = function (keyToGroup) {
            var groupedBy = [];
            for (var i = 0; i < _this.Count(); i++) {
                var currentItemInCollection = _this.ElementAt(i);
                var currentKey = keyToGroup(currentItemInCollection);
                if (currentKey) {
                    var currentGroupBy = _this.LookThroughGroupArray(currentKey, keyToGroup, groupedBy);
                    if (currentGroupBy === undefined) {
                        groupedBy.push([currentItemInCollection]);
                    }
                    else {
                        currentGroupBy.push(currentItemInCollection);
                    }
                }
            }
            return groupedBy;
        };
        // Find the index of a given object in a collection
        this.IndexOfItem = function (obj, fromIndex) {
            if (fromIndex == null) {
                fromIndex = 0;
            }
            else if (fromIndex < 0) {
                fromIndex = Math.max(0, _this._items.length + fromIndex);
            }
            for (var i = fromIndex, j = _this._items.length; i < j; i++) {
                if (_this._items[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
        this.Last = function (expression) {
            var lengthIndex = _this._items.length - 1;
            return expression === undefined ? _this._items[lengthIndex] : _this.Where(expression)[lengthIndex];
        };
        this.LastOrDefault = function (expression) {
            if (_this.Count() <= 0) {
                return undefined;
            }
            var lastWithExpression = _this.Last(expression);
            return (lastWithExpression === undefined ? undefined : lastWithExpression);
        };
        this.OrderBy = function (keySelector) {
            var orderArrayComparer = _this.ComparerForKey(keySelector, false);
            var sortedArray = _this._items.sort(orderArrayComparer);
            return _this.ConvertArrayToCollection(sortedArray);
        };
        this.OrderByDescending = function (keySelector) {
            var orderArrayComparer = _this.ComparerForKey(keySelector, true);
            var sortedArray = _this._items.sort(orderArrayComparer);
            return _this.ConvertArrayToCollection(sortedArray);
        };
        // Delete an object from the collection
        this.Remove = function (itemIndex) {
            _this._items.splice(itemIndex, 1);
        };
        this.Reverse = function () {
            var reversedArray = _this._items.reverse();
            return _this.ConvertArrayToCollection(reversedArray);
        };
        this.Select = function (expression) {
            var newArrayMapper = _this._items.map(expression);
            return _this.ConvertArrayToCollection(newArrayMapper);
        };
        this.Single = function (expression) {
            if (_this.Count() !== -1) {
                throw new TypeError('The collection does not contain exactly one element.');
            }
            return _this.First(expression);
        };
        this.SingleOrDefault = function (expression) {
            if (_this.Count() > 1) {
                throw new TypeError('The collection contains more than one element.');
            }
            return _this.Single(expression);
        };
        this.Skip = function (amount) {
            if (_this.Count() == 0) {
                return _this.EmptyCollection();
            }
            var skippedArray = _this._items.slice(Math.max(0, amount));
            return _this.ConvertArrayToCollection(skippedArray);
        };
        this.SkipWhile = function (expression) {
            var aggregated = _this.Aggregate(function (prev, current) { return expression(_this.ElementAt(prev)) ? ++prev : prev; }, 0);
            return _this.Skip(aggregated);
        };
        this.Take = function (amount) {
            if (_this.Count() == 0) {
                return _this.EmptyCollection();
            }
            var takenArray = _this._items.slice(0, Math.max(0, amount));
            return _this.ConvertArrayToCollection(takenArray);
        };
        this.TakeWhile = function (expression) {
            var aggregated = _this.Aggregate(function (prev, current) { return expression(_this.ElementAt(prev)) ? ++prev : prev; }, 0);
            return _this.Take(aggregated);
        };
        this.Where = function (expression) {
            var filteredArray = _this._items.filter(expression);
            return _this.ConvertArrayToCollection(filteredArray);
        };
        this.ToArray = function () {
            return _this._items;
        };
        this.Union = function (second) {
            return _this.Concat(second).Distinct();
        };
        this.ConvertArrayToCollection = function (arrayItems) {
            var newList = new Collection();
            for (var _i = 0, arrayItems_1 = arrayItems; _i < arrayItems_1.length; _i++) {
                var items = arrayItems_1[_i];
                newList.Add(items);
            }
            return newList;
        };
        this.EmptyCollection = function () {
            return new Collection();
        };
        this.ComparerForKey = function (keySelector, descending) {
            return function (a, b) {
                return _this.Compare(a, b, keySelector, descending);
            };
        };
        this.Compare = function (a, b, keySelector, descending) {
            var sortKeyA = keySelector(a);
            var sortKeyB = keySelector(b);
            if (sortKeyA > sortKeyB) {
                return (!descending ? 1 : -1);
            }
            if (sortKeyA < sortKeyB) {
                return (!descending ? -1 : 1);
            }
            return 0;
        };
        this.LookThroughGroupArray = function (item, keyToGroup, groupedArray) {
            for (var i = 0; i < groupedArray.length; i++) {
                if (groupedArray[i].length > 0 && keyToGroup(groupedArray[i][0]) == item) {
                    return groupedArray[i];
                }
            }
            return undefined;
        };
    }
    return Collection;
}());
//# sourceMappingURL=Collection.js.map