import { mergeProps, splitProps, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

const target = document.head;

export const cn = (...cn: string[]) => cn.filter(Boolean).join(' ');
export const css = blockDeclaration('.');
export const keyframes = blockDeclaration('@keyframes ');
export const createGlobalStyles = blockDeclaration();

export const styled =
  (tagOrComponent: ValidComponent) =>
  (strings: TemplateStringsArray, ...args: any[]) => {
    const name = css(strings, args);

    return Object.assign(StyledComponent, {
      class: name,
      [isStyled]: true,
    });

    function StyledComponent(props: any) {
      const [propClass, restProps] = splitProps(props, ['class']);
      const finalProps = mergeProps(
        {
          component: tagOrComponent,
          get class() {
            return cn(propClass.class, name);
          },
        },
        restProps
      );

      return Dynamic(finalProps);
    }
  };

// Internals

const isStyled = Symbol('isStyled');

function blockDeclaration(blockPrefix?: string) {
  return (strings: TemplateStringsArray, ...args: any[]) => {
    const cssText = compileStyles(strings, args);
    return styleToDom(blockPrefix, cssText);
  };
}

function compileStyles(strings: TemplateStringsArray, args: any[]) {
  return strings.reduce((acc, value, i) => {
    const arg = args[i];
    const result = acc + value;
    if (arg == null) return result;
    if (arg[isStyled]) return result + arg.class;
    return result + arg;
  });
}

function styleToDom(blockPrefix: string | undefined, compiled: string) {
  const name = 'amq' + hash(compiled);
  const content = blockPrefix
    ? `${blockPrefix}${name} { ${compiled} }`
    : compiled;

  addStyle(name, content);
  return name;
}

function addStyle(id: string, cssText: string) {
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.append(cssText);
  target.append(style);
}

function hash(text: string) {
  let out = 11;
  for (let i = 0; i < text.length; i++) {
    out = (101 * out + text.charCodeAt(i)) >>> 0;
  }
  return out;
}