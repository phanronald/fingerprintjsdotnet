

interface IDictionaryPair<K, V> {
	key: K;
	value: V;
}

class Dictionary<K, V> {

	private internalArray: { [key: string]: IDictionaryPair<K, V> } = {};

	public Add = (key: K, value: V): void => {
		this.internalArray[String(key)] = { key: key, value: value };
	}

	public AddRange = (items: IDictionaryPair<K, V>[]): void => {
		for (var kvPair of items) {
			this.Add(kvPair.key, kvPair.value);
		}
	}

	public Any = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): boolean => {
		return expression === undefined ? this.Count() > 0 : this.ToArray().some(expression);
	}

	public Clear = (): void => {
		this.internalArray = {};
	}

	public Concat = (second: Dictionary<K, V>): Dictionary<K, V> => {
		var newConcatArray = this.ToArray().concat(second.ToArray());
		return this.ConvertArrayToDictionary(newConcatArray);
	}

	public Contains = (kvPair: IDictionaryPair<K, V>): boolean => {
		return this.ToArray().some(x => x === kvPair);
	}

	public ContainsKey = (key: K): boolean => {
		return (this.GetItem(key) !== undefined);
	}

	public ContainsValue = (value: V): boolean => {

		const allValues = this.GetValues();
		for (var val of allValues) {
			if (val === value) {
				return true;
			}
		}

		return false;
	}

	public Count = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): number => {
		return expression === undefined ? Object.keys(this.internalArray).length : this.Where(expression).Count();
	}

	public Distinct = (): Dictionary<K, V> => {
		return this.Where((value: IDictionaryPair<K, V>, index: number, iter: IDictionaryPair<K, V>[]) => iter.indexOf(value) === index);
	}


	public ElementAt = (key: K): IDictionaryPair<K, V> => {
		const kvPair: IDictionaryPair<K, V> = this.internalArray[String(key)];
		if (typeof (kvPair) === 'undefined') {
			return undefined;
		}

		return kvPair;
	}

	public ElementAtOrDefault = (key: K): IDictionaryPair<K, V> => {
		return this.ElementAt(key) || undefined;
	}

	public First = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> => {
		return expression === undefined ? this.internalArray[0] : this.Where(expression)[0];
	}

	public FirstOrDefault = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> => {
		if (this.Count() <= 0) {
			return undefined;
		}

		const firstKVPair = this.First(expression);
		return (firstKVPair === undefined ? undefined : firstKVPair);
	}

	public GetKeys = (): K[] => {
		let keyArray: K[] = [];

		Object.keys(this.internalArray).map((key, index) => {

			const kvPair: IDictionaryPair<K, V> = this.internalArray[String(key)];
			keyArray.push(kvPair.key);

		});

		return keyArray;
	}

	public GetItem = (key: K): IDictionaryPair<K, V> => {
		return this.internalArray[String(key)];
	}

	public GetValue = (key: K): V => {
		const kvPair: IDictionaryPair<K, V> = this.internalArray[String(key)];
		if (typeof (kvPair) === 'undefined') {
			return undefined;
		}

		return kvPair.value;
	}

	public GetValues = (): V[] => {

		let valueArray: V[] = [];

		Object.keys(this.internalArray).map((key, index) => {

			const kvPair: IDictionaryPair<K, V> = this.internalArray[String(key)];
			valueArray.push(kvPair.value);

		});

		return valueArray;
	}

	public GroupBy = (keyToGroup: (key: IDictionaryPair<K, V>) => any): Array<IDictionaryPair<K, V>[]> => {

		let groupedBy: Array<IDictionaryPair<K, V>[]> = []
		//for (let i = 0; i < this.Count(); i++) {
		//	let currentItemInCollection = this.ElementAt(i);
		//	let currentKey = keyToGroup(currentItemInCollection);
		//	if (currentKey) {
		//		let currentGroupBy = this.LookThroughGroupArray(currentKey, keyToGroup, groupedBy);
		//		if (currentGroupBy === undefined) {
		//			groupedBy.push([currentItemInCollection]);
		//		}
		//		else {
		//			currentGroupBy.push(currentItemInCollection);
		//		}
		//	}
		//}

		return groupedBy;
	}

	public Last = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> => {
		const dictionaryLengthIndex = this.Count() - 1;
		return expression === undefined ? this.internalArray[dictionaryLengthIndex] : this.Where(expression)[dictionaryLengthIndex];
	}

	public LastOrDefault = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> => {
		if (this.Count() <= 0) {
			return undefined;
		}

		const lastKVPair = this.Last(expression);
		return (lastKVPair === undefined ? undefined : lastKVPair);
	}

	public OrderBy = (keySelector: (key: IDictionaryPair<K, V>) => any): Dictionary<K, V> => {

		let orderArrayComparer: ((a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>) => any) = this.ComparerForKey(keySelector, false);
		let sortedArray: IDictionaryPair<K, V>[] = this.ToArray().sort(orderArrayComparer);
		return this.ConvertArrayToDictionary(sortedArray);
	}

	public Reverse = (): Dictionary<K, V> => {
		let reversedDictionary: Dictionary<K, V> = new Dictionary<K, V>();
		const arrayInReverse: IDictionaryPair<K, V>[] = this.ToArray().reverse();
		for (var kvPair of arrayInReverse) {
			reversedDictionary.Add(kvPair.key, kvPair.value);
		}

		return reversedDictionary;
	}

	public Select = (expression: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => any): Dictionary<K, V> => {
		var newArrayMapper = this.ToArray().map(expression);
		return this.ConvertArrayToDictionary(newArrayMapper);
	}

	public Single = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> | TypeError => {
		if (this.Count() !== -1) {
			throw new TypeError('The collection does not contain exactly one element.');
		}

		return this.First(expression);
	}

	public SingleOrDefault = (expression?: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): IDictionaryPair<K, V> | TypeError => {
		if (this.Count() > 1) {
			throw new TypeError('The collection contains more than one element.');
		}

		return this.Single(expression);
	}

	public Skip = (amount: number): Dictionary<K, V> => {
		if (this.Count() == 0) {
			this.EmptyDictionary();
		}

		const skippedDictionary = this.ToArray().slice(Math.max(0, amount));
		return this.ConvertArrayToDictionary(skippedDictionary);
	}

	public Take = (amount: number): Dictionary<K, V> => {
		if (this.Count() == 0) {
			return this.EmptyDictionary();
		}

		const takenDictionary = this.ToArray().slice(0, Math.max(0, amount));
		return this.ConvertArrayToDictionary(takenDictionary);
	}

	public ToArray = (): IDictionaryPair<K, V>[] => {

		let dictionaryInArray: IDictionaryPair<K, V>[] = [];

		Object.keys(this.internalArray).map((key, index) => {

			const kvPair: IDictionaryPair<K, V> = this.internalArray[String(key)];
			dictionaryInArray.push(kvPair);
		});

		return dictionaryInArray;
	}

	public Union = (second: Dictionary<K, V>): Dictionary<K, V> => {
		return this.Concat(second).Distinct();
	}

	public Where = (expression: (value?: IDictionaryPair<K, V>, index?: number, list?: IDictionaryPair<K, V>[]) => boolean): Dictionary<K, V> => {
		const filteredArray = this.ToArray().filter(expression);
		return this.ConvertArrayToDictionary(filteredArray);
	}

	private ConvertArrayToDictionary = (arrayItems: IDictionaryPair<K, V>[]): Dictionary<K, V> => {

		let newDictionary: Dictionary<K, V> = new Dictionary<K, V>();
		for (var kvPair of arrayItems) {
			newDictionary.Add(kvPair.key, kvPair.value);
		}

		return newDictionary;
	}

	private ComparerForKey = (keySelector: (key: IDictionaryPair<K, V>) => any, descending?: boolean): ((a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>) => number) => {

		return (a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>) => {
			return this.Compare(a, b, keySelector, descending);
		};
	}

	private Compare = (a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>, keySelector: (key: IDictionaryPair<K, V>) => any, descending?: boolean): number => {
		const sortKeyA = keySelector(a);
		const sortKeyB = keySelector(b);

		let typeOfVariable:boolean = typeof (sortKeyA) == 'string';

		return typeOfVariable ? sortKeyA.localeCompare(b) : sortKeyA - sortKeyB;
	}

	private EmptyDictionary = (): Dictionary<K, V> => {
		return new Dictionary<K, V>();
	}

	private LookThroughGroupArray = (item: IDictionaryPair<K, V>,
									keyToGroup: (key: IDictionaryPair<K, V>) => IDictionaryPair<K, V>,
									groupedArray: Array<IDictionaryPair<K, V>[]>): IDictionaryPair<K, V>[] => {

		for (let i = 0; i < groupedArray.length; i++) {
			if (groupedArray[i].length > 0 && keyToGroup(groupedArray[i][0]) == item) {
				return groupedArray[i];
			}
		}

		return undefined;
	}
}