// tiptap.config.ts - Configurações opcionais do Tiptap
// Este arquivo é opcional e pode ser usado para configurações avançadas

export const TIPTAP_CONFIG = {
  // Configurações do editor
  editor: {
    // Ativa o modo de desenvolvimento (mais logs)
    debug: process.env.NODE_ENV === 'development',

    // Configurações do conteúdo
    parseOptions: {
      preserveWhitespace: 'full',
    },

    // Configurações de atributos do editor
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3',
        'data-testid': 'tiptap-editor',
      },
      // Manipulação de paste
      handlePaste: (view: any, event: ClipboardEvent) => {
        // Aqui você pode customizar como o paste funciona
        return false; // false = comportamento padrão
      },
    },
  },

  // Configurações de sanitização
  sanitization: {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
    ],
    allowedAttributes: ['href', 'target', 'rel'],
  },

  // Configurações de extensões
  extensions: {
    starterKit: {
      // Configurações do StarterKit
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      heading: {
        levels: [1, 2, 3],
      },
    },

    link: {
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
      },
    },
  },
};

// Hook personalizado para usar configurações do Tiptap
export const useTiptapConfig = () => {
  return TIPTAP_CONFIG;
};
