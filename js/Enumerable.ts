/// <reference path="interfaces/ienumberable.ts" />

class Enumberable<T> implements IEnumberable<T> {

	// The underlying array data structure of the collection
	protected _items: Array<T> = [];

	constructor(items: T[] = []) {
		this._items = items;
	}

	// Add an object to the collection
	public Add = (item: T): void => {
		this._items.push(item);
	}

	public AddRange = (items: T[]): void => {
		this._items.push(...items);
	}

	public Aggregate = <U>(callbackfun: (previousValue: U, currentValue?: T, currentIndex?: number, list?: T[]) => any, initialValue?: U): any => {
		if (this.Count() <= 0) {
			return undefined;
		}

		const newerInitialValue: T | U = initialValue === undefined ? this.DefaultValuePerType(this.First()) : initialValue;
		return this._items.reduce(callbackfun, newerInitialValue);
	}

	public All = (predicate: (value?: T, index?: number, list?: T[]) => boolean): boolean => {
		return this._items.every(predicate);
	}

	public Any = (expression?: (value?: T, index?: number, list?: T[]) => boolean): boolean => {
		return expression === undefined ? this._items.length > 0 : this._items.some(expression);
	}

	public Average = (expression?: (value?: T, index?: number, list?: T[]) => any): number => {

		if (this.Count() < 0) {
			throw new Error("No items in the collection.");
		}

		const collectionItemType = typeof this.ElementAt(0);
		if (collectionItemType !== "number") {
			throw new Error(collectionItemType + " does have the defintion of 'Average'");
		}

		return this.Sum(expression) / this.Count(expression);

	}

	public Clear = (): void => {
		this._items = [];
	}

	public Concat = (second: Enumberable<T>): Enumberable<T> => {
		var newConcatArray = this._items.concat(second.ToArray());
		return new Enumberable<T>(newConcatArray);
	}

	public Contains = (item: T): boolean => {
		return this._items.some(x => x === item);
	}

	// Length of the collection
	public Count = (expression?: (value?: T, index?: number, list?: T[]) => boolean): number => {
		return expression === undefined ? this._items.length : this.Where(expression).Count();
	}

	public DefaultIfEmpty = (defaultValue?: T): Enumberable<T> => {
		return this.Count() ? this : new Enumberable<T>([defaultValue]);
	}

	public Distinct = (): Enumberable<T> => {
		return this.Where((value: T, index: number, iter: T[]) => iter.indexOf(value) === index);
	}

	// Get a specific item from a collection given it's index
	public ElementAt = (index: number): T => {
		if (this.Count() == 0 || index > this.Count()) {
			throw new Error('ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.');
		}

		return this._items[index];
	}

	public ElementAtOrDefault = (index: number): T => {
		return this.ElementAt(index) || undefined;
	}

	public Except = (source: Enumberable<T>): Enumberable<T> => {
		return this.Where(x => !source.Contains(x));
	}

	public Exists = (predicate: (value?: T, index?: number, list?: T[]) => boolean): boolean => {
		return this.Where(predicate).Count() > 0;
	}

	public ForEach = (action: (value?: T, index?: number, list?: T[]) => any): void => {
		return this._items.forEach(action);
	}

	public First = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {
		if (this.Count() < 0) {
			throw new Error('InvalidOperationException: The source sequence is empty.');
		}

		return expression === undefined ? this._items[0] : this.Where(expression).First();
	}

	public FirstOrDefault = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {
		if (this.Count() <= 0) {
			return undefined;
		}

		const firstWithExpression = this.First(expression);
		return (firstWithExpression === undefined ? undefined : firstWithExpression);
	}

	public GetRange = (index: number, count: number): Enumberable<T> => {

		const absIndex: number = Math.abs(index);
		const absCount: number = Math.abs(count);
		const finalCount: number = absIndex + absCount > this._items.length ? (this._items.length - 1) : absIndex + absCount;
		return new Enumberable<T>(this._items.slice(absIndex, finalCount));
	}

	public GroupBy = (keySelector: (key: T) => any, elementSelector: (key: T) => any): void => {

		//let groupedEnumberable = new Enumberable<IGrouping<any, any>>();

		this.Aggregate(
			(grouped, item) => ((<any>grouped)[keySelector(item)] ?
				(<any>grouped)[keySelector(item)].push(elementSelector(item)) :
				(<any>grouped)[keySelector(item)] = [elementSelector(item)], grouped),
			{});
	}

	public IndexOf = (item: T, startIndex?:number): number => {
		return this._items.indexOf(item, startIndex);
	}

	public Insert = (index: number, element: T): void => {
		if (index < 0 || index > this._items.length) {
			throw new Error('Index is out of range.');
		}

		this._items.splice(index, 0, element);
	}

	public InsertRange = (index: number, source: IEnumberable<T>): void => {
		let currentIndex = index;
		source.ToArray().forEach((item) => {
			this.Insert(currentIndex, item);
			currentIndex++;
		});
	}

	public Intersect = (source: Enumberable<T>): Enumberable<T> => {
		return this.Where(x => source.Contains(x));
	}

	public Last = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {

		if (this.Count() < 0) {
			throw new Error('InvalidOperationException: The source sequence is empty.');
		}

		return expression === undefined ? this._items[this._items.length - 1] : this.Where(expression).Last();

	}

	public LastOrDefault = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {
		if (this.Count() <= 0) {
			return undefined;
		}

		const lastWithExpression = this.Last(expression);
		return (lastWithExpression === undefined ? undefined : lastWithExpression);
	}

	public LastIndexOf = (item: T, startIndex?:number): number => {
		return this._items.lastIndexOf(item, startIndex);
	}

	public Max = (): T => {
		return <T>this.Aggregate((currentMax: T, currentValue: T) => currentMax > currentValue ? currentMax : currentValue);
	}

	public MemberwiseClone = (): Enumberable<T> => {
		return new Enumberable<T>(this._items.slice(0));
	}

	public Min = (): T => {
		return <T>this.Aggregate((currentMin: T, currentValue: T) => currentMin < currentValue ? currentMin : currentValue);
	}

	public OrderBy = (keySelector: (key: T) => any): Enumberable<T> => {
		let orderArrayComparer: ((a: T, b: T) => any) = this.ComparerForKey(keySelector, false);
		return new Enumberable(this._items.slice(0).sort(orderArrayComparer));
	}

	public OrderByDescending = (keySelector: (key: T) => any): Enumberable<T> => {
		let orderArrayComparer: ((a: T, b: T) => any) = this.ComparerForKey(keySelector, true);
		return new Enumberable(this._items.slice(0).sort(orderArrayComparer));
	}

	public Remove = (item: T): boolean => {
		return this._items.indexOf(item) !== -1 ? (this.RemoveAt(this._items.indexOf(item)), true) : false;
	}

	public RemoveAll = (predicate: (value?: T, index?: number, list?: T[]) => boolean): number => {
		const itemsToBeRemoved = this.Where(predicate);
		itemsToBeRemoved.ToArray().forEach((item) => {
			this.Remove(item);
		});

		return itemsToBeRemoved.Count();
	}

	// Delete an object from the collection
	public RemoveAt = (index: number): void => {
		this.RemoveRange(index, 1);
	}

	public RemoveRange = (index: number, count:number): void => {
		this._items.splice(index, count);
	}

	public Reverse = (): Enumberable<T> => {
		return new Enumberable<T>(this._items.reverse());
	}

	public Select = <U>(expression: (value?: T, index?: number, list?: T[]) => U): Enumberable<U> => {
		var newArrayMapper = this._items.map(expression);
		return new Enumberable<U>(newArrayMapper);
	}

	public SelectMany = <U extends Enumberable<any>>(expression: (value?: T, index?: number, list?: T[]) => U): U => {

		return this.Aggregate((groupedCollection: U, currentValue, currentIndex) => (groupedCollection.AddRange(this.Select(expression).ElementAt(currentIndex).ToArray()), groupedCollection), new Enumberable<any>());
	}

	public Single = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {
		if (this.Count() !== -1) {
			throw new Error('The collection does not contain exactly one element.');
		}

		return this.First(expression);
	}

	public SingleOrDefault = (expression?: (value?: T, index?: number, list?: T[]) => boolean): T => {
		if (this.Count() > 1) {
			throw new Error('The collection contains more than one element.');
		}

		return this.Single(expression);
	}

	public Skip = (amount: number): Enumberable<T> => {
		if (this.Count() == 0) {
			return this;
		}

		const skippedArray = this._items.slice(Math.abs(amount));
		return new Enumberable<T>(skippedArray);
	}

	public SkipWhile = (expression?: (value?: T, index?: number, list?: T[]) => boolean): Enumberable<T> => {
		var skipWhileCollection = this.Negate(expression);
		return this.Where(skipWhileCollection);
	}

	public Sum = (expression?: (value?: T, index?: number, list?: T[]) => number): number => {
		if (this.Count() < 0) {
			throw new Error("No items in the collection.");
		}

		const collectionItemType = typeof this.ElementAt(0);
		if (collectionItemType !== "number") {
			throw new Error(collectionItemType + " does have the defintion of 'Sum'");
		}

		return expression === undefined ? <number>this.Aggregate((result: number, currentValue: T) => result += (<number><any>currentValue)) : this.Select(expression).Sum();
	}

	public Take = (amount: number): Enumberable<T> => {
		if (this.Count() == 0) {
			return this;
		}

		const takenArray = this._items.slice(0, Math.abs(amount));
		return new Enumberable<T>(takenArray);
	}

	public TakeWhile = (expression?: (value?: T, index?: number, list?: T[]) => boolean): Enumberable<T> => {

		var takeWhileIdx: number = <number>this.Aggregate((prev: number, currentValue: T) => expression(this.ElementAt(prev)) ? ++prev : prev);
		return this.Take(takeWhileIdx);
	}

	public Where = (expression?: (value?: T, index?: number, list?: T[]) => boolean): Enumberable<T> => {
		const filteredArray = this._items.filter(expression);
		return new Enumberable<T>(filteredArray);
	}

	public ToArray = (): T[] => {
		return this._items;
	}

	public Union = (second: Enumberable<T>): Enumberable<T> => {
		return this.Concat(second);
	}

	private ComparerForKey = (keySelector: (key: T) => any, descending?: boolean): ((a: T, b: T) => number) => {

		return (a: T, b: T) => {
			return this.Compare(a, b, keySelector, descending);
		};
	}

	private Compare = (a: T, b: T, keySelector: (key: T) => any, descending?: boolean): number => {
		const sortKeyA = keySelector(a);
		const sortKeyB = keySelector(b);
		if (sortKeyA > sortKeyB) {
			return (!descending ? 1 : -1);
		}

		if (sortKeyA < sortKeyB) {
			return (!descending ? -1 : 1);
		}

		return 0;
	}

	private ComposeComparers = (previousComparer: (a: T, b: T) => number, currentComparer: (a: T, b: T) => number): ((a: T, b: T) => number) => {

		return (a: T, b: T) => {
			let resultOfPreviousComparer = previousComparer(a, b);
			if (!resultOfPreviousComparer) {
				return currentComparer(a, b);
			}
			else {
				resultOfPreviousComparer;
			}
		};
	}

	private DefaultValuePerType = (collectionType: T): T => {

		switch (typeof collectionType) {
			case "undefined":
				{
					return undefined;
				}
			case "number":
				{
					return <T><any>0;
				}
			case "string":
				{
					return <T><any>"";
				}
			case "boolean":
				{
					return <T><any>false;
				}
			case "object":
				{
					if (collectionType === null) {
						return <T><any>{};
					}

					let isArray: boolean = Array.isArray(collectionType);
					if (isArray) {
						return <T><any>[];
					}

					return <T><any>{};
				}
		};
	}

	private LookThroughGroupArray = (item: T, keyToGroup: (key: T) => T, groupedArray: Array<T[]>): T[] => {

		for (let i = 0; i < groupedArray.length; i++) {
			if (groupedArray[i].length > 0 && keyToGroup(groupedArray[i][0]) == item) {
				return groupedArray[i];
			}
		}

		return undefined;
	}

	private Negate(expression: (value?: T, index?: number, list?: T[]) => boolean): () => any {
		return function (): any {
			return !expression.apply(this, arguments);
		};
	}

}