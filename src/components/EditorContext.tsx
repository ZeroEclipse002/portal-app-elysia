import { createContext, useContext, useState } from 'react';

interface EditorState {
    wordCount: number;
    blocks: Array<{
        id: string;
        type: string;
        content?: string | Array<{ type: string; text: string; styles?: Record<string, any> }>;
    }>;
}

interface EditorContextType {
    state: EditorState;
    setState: React.Dispatch<React.SetStateAction<EditorState>>;
}

const initialState: EditorState = {
    wordCount: 0,
    blocks: []
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<EditorState>(initialState);

    return (
        <EditorContext.Provider value={{ state, setState }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
