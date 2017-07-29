/// <reference path="interfaces/ienumberable.ts" />
var Enumberable = (function () {
    function Enumberable(items) {
        if (items === void 0) { items = []; }
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
            if (_this.Count() <= 0) {
                return undefined;
            }
            var newerInitialValue = initialValue === undefined ? _this.DefaultValuePerType(_this.First()) : initialValue;
            return _this._items.reduce(callbackfun, newerInitialValue);
        };
        this.All = function (predicate) {
            return _this._items.every(predicate);
        };
        this.Any = function (expression) {
            return expression === undefined ? _this._items.length > 0 : _this._items.some(expression);
        };
        this.Average = function (expression) {
            if (_this.Count() < 0) {
                throw new Error("No items in the collection.");
            }
            var collectionItemType = typeof _this.ElementAt(0);
            if (collectionItemType !== "number") {
                throw new Error(collectionItemType + " does have the defintion of 'Average'");
            }
            return _this.Sum(expression) / _this.Count(expression);
        };
        this.Clear = function () {
            _this._items = [];
        };
        this.Concat = function (second) {
            var newConcatArray = _this._items.concat(second.ToArray());
            return new Enumberable(newConcatArray);
        };
        this.Contains = function (item) {
            return _this._items.some(function (x) { return x === item; });
        };
        // Length of the collection
        this.Count = function (expression) {
            return expression === undefined ? _this._items.length : _this.Where(expression).Count();
        };
        this.DefaultIfEmpty = function (defaultValue) {
            return _this.Count() ? _this : new Enumberable([defaultValue]);
        };
        this.Distinct = function () {
            return _this.Where(function (value, index, iter) { return iter.indexOf(value) === index; });
        };
        // Get a specific item from a collection given it's index
        this.ElementAt = function (index) {
            if (_this.Count() == 0 || index > _this.Count()) {
                throw new Error('ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.');
            }
            return _this._items[index];
        };
        this.ElementAtOrDefault = function (index) {
            return _this.ElementAt(index) || undefined;
        };
        this.Except = function (source) {
            return _this.Where(function (x) { return !source.Contains(x); });
        };
        this.Exists = function (predicate) {
            return _this.Where(predicate).Count() > 0;
        };
        this.ForEach = function (action) {
            return _this._items.forEach(action);
        };
        this.First = function (expression) {
            if (_this.Count() < 0) {
                throw new Error('InvalidOperationException: The source sequence is empty.');
            }
            return expression === undefined ? _this._items[0] : _this.Where(expression).First();
        };
        this.FirstOrDefault = function (expression) {
            if (_this.Count() <= 0) {
                return undefined;
            }
            var firstWithExpression = _this.First(expression);
            return (firstWithExpression === undefined ? undefined : firstWithExpression);
        };
        this.GetRange = function (index, count) {
            var absIndex = Math.abs(index);
            var absCount = Math.abs(count);
            var finalCount = absIndex + absCount > _this._items.length ? (_this._items.length - 1) : absIndex + absCount;
            return new Enumberable(_this._items.slice(absIndex, finalCount));
        };
        this.GroupBy = function (keySelector, elementSelector) {
            //let groupedEnumberable = new Enumberable<IGrouping<any, any>>();
            _this.Aggregate(function (grouped, item) { return (grouped[keySelector(item)] ?
                grouped[keySelector(item)].push(elementSelector(item)) :
                grouped[keySelector(item)] = [elementSelector(item)], grouped); }, {});
        };
        this.IndexOf = function (item, startIndex) {
            return _this._items.indexOf(item, startIndex);
        };
        this.Insert = function (index, element) {
            if (index < 0 || index > _this._items.length) {
                throw new Error('Index is out of range.');
            }
            _this._items.splice(index, 0, element);
        };
        this.InsertRange = function (index, source) {
            var currentIndex = index;
            source.ToArray().forEach(function (item) {
                _this.Insert(currentIndex, item);
                currentIndex++;
            });
        };
        this.Intersect = function (source) {
            return _this.Where(function (x) { return source.Contains(x); });
        };
        this.Last = function (expression) {
            if (_this.Count() < 0) {
                throw new Error('InvalidOperationException: The source sequence is empty.');
            }
            return expression === undefined ? _this._items[_this._items.length - 1] : _this.Where(expression).Last();
        };
        this.LastOrDefault = function (expression) {
            if (_this.Count() <= 0) {
                return undefined;
            }
            var lastWithExpression = _this.Last(expression);
            return (lastWithExpression === undefined ? undefined : lastWithExpression);
        };
        this.LastIndexOf = function (item, startIndex) {
            return _this._items.lastIndexOf(item, startIndex);
        };
        this.Max = function () {
            return _this.Aggregate(function (currentMax, currentValue) { return currentMax > currentValue ? currentMax : currentValue; });
        };
        this.MemberwiseClone = function () {
            return new Enumberable(_this._items.slice(0));
        };
        this.Min = function () {
            return _this.Aggregate(function (currentMin, currentValue) { return currentMin < currentValue ? currentMin : currentValue; });
        };
        this.OrderBy = function (keySelector) {
            var orderArrayComparer = _this.ComparerForKey(keySelector, false);
            return new Enumberable(_this._items.slice(0).sort(orderArrayComparer));
        };
        this.OrderByDescending = function (keySelector) {
            var orderArrayComparer = _this.ComparerForKey(keySelector, true);
            return new Enumberable(_this._items.slice(0).sort(orderArrayComparer));
        };
        this.Remove = function (item) {
            return _this._items.indexOf(item) !== -1 ? (_this.RemoveAt(_this._items.indexOf(item)), true) : false;
        };
        this.RemoveAll = function (predicate) {
            var itemsToBeRemoved = _this.Where(predicate);
            itemsToBeRemoved.ToArray().forEach(function (item) {
                _this.Remove(item);
            });
            return itemsToBeRemoved.Count();
        };
        // Delete an object from the collection
        this.RemoveAt = function (index) {
            _this.RemoveRange(index, 1);
        };
        this.RemoveRange = function (index, count) {
            _this._items.splice(index, count);
        };
        this.Reverse = function () {
            return new Enumberable(_this._items.reverse());
        };
        this.Select = function (expression) {
            var newArrayMapper = _this._items.map(expression);
            return new Enumberable(newArrayMapper);
        };
        this.SelectMany = function (expression) {
            return _this.Aggregate(function (groupedCollection, currentValue, currentIndex) { return (groupedCollection.AddRange(_this.Select(expression).ElementAt(currentIndex).ToArray()), groupedCollection); }, new Enumberable());
        };
        this.Single = function (expression) {
            if (_this.Count() !== -1) {
                throw new Error('The collection does not contain exactly one element.');
            }
            return _this.First(expression);
        };
        this.SingleOrDefault = function (expression) {
            if (_this.Count() > 1) {
                throw new Error('The collection contains more than one element.');
            }
            return _this.Single(expression);
        };
        this.Skip = function (amount) {
            if (_this.Count() == 0) {
                return _this;
            }
            var skippedArray = _this._items.slice(Math.abs(amount));
            return new Enumberable(skippedArray);
        };
        this.SkipWhile = function (expression) {
            var skipWhileCollection = _this.Negate(expression);
            return _this.Where(skipWhileCollection);
        };
        this.Sum = function (expression) {
            if (_this.Count() < 0) {
                throw new Error("No items in the collection.");
            }
            var collectionItemType = typeof _this.ElementAt(0);
            if (collectionItemType !== "number") {
                throw new Error(collectionItemType + " does have the defintion of 'Sum'");
            }
            return expression === undefined ? _this.Aggregate(function (result, currentValue) { return result += currentValue; }) : _this.Select(expression).Sum();
        };
        this.Take = function (amount) {
            if (_this.Count() == 0) {
                return _this;
            }
            var takenArray = _this._items.slice(0, Math.abs(amount));
            return new Enumberable(takenArray);
        };
        this.TakeWhile = function (expression) {
            var takeWhileIdx = _this.Aggregate(function (prev, currentValue) { return expression(_this.ElementAt(prev)) ? ++prev : prev; });
            return _this.Take(takeWhileIdx);
        };
        this.Where = function (expression) {
            var filteredArray = _this._items.filter(expression);
            return new Enumberable(filteredArray);
        };
        this.ToArray = function () {
            return _this._items;
        };
        this.Union = function (second) {
            return _this.Concat(second);
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
        this.ComposeComparers = function (previousComparer, currentComparer) {
            return function (a, b) {
                var resultOfPreviousComparer = previousComparer(a, b);
                if (!resultOfPreviousComparer) {
                    return currentComparer(a, b);
                }
                else {
                    resultOfPreviousComparer;
                }
            };
        };
        this.DefaultValuePerType = function (collectionType) {
            switch (typeof collectionType) {
                case "undefined":
                    {
                        return undefined;
                    }
                case "number":
                    {
                        return 0;
                    }
                case "string":
                    {
                        return "";
                    }
                case "boolean":
                    {
                        return false;
                    }
                case "object":
                    {
                        if (collectionType === null) {
                            return {};
                        }
                        var isArray = Array.isArray(collectionType);
                        if (isArray) {
                            return [];
                        }
                        return {};
                    }
            }
            ;
        };
        this.LookThroughGroupArray = function (item, keyToGroup, groupedArray) {
            for (var i = 0; i < groupedArray.length; i++) {
                if (groupedArray[i].length > 0 && keyToGroup(groupedArray[i][0]) == item) {
                    return groupedArray[i];
                }
            }
            return undefined;
        };
        this._items = items;
    }
    Enumberable.prototype.Negate = function (expression) {
        return function () {
            return !expression.apply(this, arguments);
        };
    };
    return Enumberable;
}());
//# sourceMappingURL=Enumerable.js.map