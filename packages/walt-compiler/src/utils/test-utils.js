import { link } from "walt-link";
import { stringDecoder } from "../utils/string";
import {
  mapNode,
  walkNode,
  parser,
  semantics,
  validate,
  emitter,
  generator,
  prettyPrintNode,
} from "..";

export const harness = filepath => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);

  const build = link(
    filepath,
    { logger: console },
    {
      mapNode,
      walkNode,
      parser,
      semantics,
      validate,
      emitter,
      generator,
      prettyPrintNode,
    }
  );
  return build({
    env: {
      memory,
      MEMORY_OFFSET: 0,
      log: console.log,
      assert(strPointer, value, expected) {
        let text = "";

        const decoder = stringDecoder(view, strPointer);
        let iterator = decoder.next();
        while (!iterator.done) {
          text += String.fromCodePoint(iterator.value);
          iterator = decoder.next();
        }

        t.is(value, expected, text);
      },
    },
  }).then(module => module.instance.exports.run());
};
