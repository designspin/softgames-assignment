import { Assets, Texture } from "pixi.js";

type Token = 
    | { type: 'text'; content: string }
    | { type: 'emoji'; name: string; url: string }

export type ProcessedDialogueLine = {
    name: string;
    tokens: Token[];
    avatar: AvatarData | null;
    position: "left" | "right";
}

export type ProcessedData = {
    lines: ProcessedDialogueLine[];
}

type DialogueLine = {
    name: string;
    text: string;
}

type EmojiData = {
    name: string;
    url: string;
}

type AvatarData = {
    name: string;
    url: string;
    position: "left" | "right";
}

type MagicWordsData = {
    dialogue: DialogueLine[];
    emojies: EmojiData[];
    avatars: AvatarData[];
}

const API_URL = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";

function sanitiseUrl(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}`;
    } catch {
        return url;
    }
}

function validateMagicWordsData(data: unknown): data is MagicWordsData {
    if(!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if(!Array.isArray(d.dialogue) || !Array.isArray(d.emojies) || !Array.isArray(d.avatars)) return false;
    return d.dialogue.every(line => typeof line.name === 'string' && typeof line.text === 'string')
}

function tokenise(text: string, emojiMap: Map<string, string>): Token[] {
    const tokens: Token[] = [];
    const regex = /{(\w+)}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while((match = regex.exec(text)) !== null) {
        if(match.index > lastIndex) 
            tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        
        const url = emojiMap.get(match[1]);
        if(url) {
            tokens.push({ type: 'emoji', name: match[1], url });
        } else {
            tokens.push({ type: 'text', content: match[0] });
        }
        lastIndex = regex.lastIndex;
    }

    if(lastIndex < text.length) {
        tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return tokens;
}

export async function fetchMagicWordsData(): Promise<ProcessedData> {
    const response = await fetch(API_URL);
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if(!validateMagicWordsData(data)) throw new Error("Unexpected API response format");

    const emojiMap = new Map(data.emojies.map(e => [e.name, sanitiseUrl(e.url)]));
    const avatarMap = new Map(data.avatars.map(a => [a.name, { ...a, url: sanitiseUrl(a.url) }]));

    const lines = data.dialogue.map(line => {
        const avatar = avatarMap.get(line.name) || null;
        return {
            name: line.name,
            tokens: tokenise(line.text, emojiMap),
            avatar,
            position: avatar ? avatar.position : "left"
        };  
    });

    return { lines };
}

export async function loadDialogueAssets(data: ProcessedData): Promise<Map<string, Texture>> {
    const emojiUrls = data.lines
        .flatMap(line => line.tokens)
        .filter(token => token.type === 'emoji')
        .map(token => token.url);

    const avatarUrls = data.lines
        .map(line => line.avatar?.url)
        .filter((url): url is string => typeof url !== 'undefined');

    const allUrls = [...new Set([...emojiUrls, ...avatarUrls])];

    allUrls.forEach(url => Assets.add({ alias: url, src: url, parser: 'loadTextures' }));
    const entries = await Promise.all(
        allUrls.map(async url => [url, await Assets.load<Texture>(url)] as const)
    );


    return new Map(entries);
}