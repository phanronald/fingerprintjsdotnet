interface IBlockAdblockOptions {
	CheckOnLoad: boolean;
	ResetOnEnd: boolean;
	LoopCheckTime: number;
	LoopMaxNumber: number;
	BaitClass: string;
	BaitStyle: string;
	DebugMode: boolean;
}

interface IBlockAdblockSettings {
	Version: string;
	Bait: IBlockAdblockBaitOption;
	Checking: boolean;
	Loop: number;
	LoopNumber: number;
	Event: IBlockAdblockEventOption;
}

interface IBlockAdblockBaitOption {
	BaitNode: Node;
	OffsetParent: Element;
	OffsetHeight: number;
	OffsetLeft: number;
	OffsetTop: number;
	OffsetWidth: number;
	ClientHeight: number;
	ClientWidth: number;
}

interface IBlockAdblockEventOption {
	Detected: Array<Function>;
	NotDetected: Array<Function>;
}