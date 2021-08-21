
import { std } from "../../deps.ts";
import { Util } from "../util.ts";
import { Console } from "../console.ts";

try
{
    const tests: Deno.TestDefinition[] =
        [
            {
                name: "UUID uniqueness",
                async fn()
                {
                    const [first, second] =
                        [await Util.uuid(), await Util.uuid()];
                    std.asserts.assertNotEquals(first, second);
                }
            },
            {
                name: "class method bind",
                fn()
                {
                    const invoker =
                    {
                        invoke: function (invoker: () => string)
                        {
                            return invoker();
                        }
                    };

                    class Unbound
                    {
                        private field: string = "field" as const;
                        constructor() { }
                        function()
                        {
                            return this.field;
                        }
                    }
                    const unbound = new Unbound();
                    const unboundInvocation = function ()
                    {
                        invoker.invoke(unbound.function);
                    };
                    std.asserts.assertThrows(unboundInvocation, TypeError);

                    class Bound
                    {
                        private field: string = "field" as const;
                        constructor() { Util.bind(this); }
                        function()
                        {
                            return this.field;
                        }
                    }
                    const bound = new Bound();
                    std.asserts.assertEquals(invoker.invoke(bound.function),
                        "field");
                }
            }
        ];
    for (const test of tests)
        Deno.test(test);
}
catch (error)
{
    Console.error(error.toString());
    Deno.exit(1);
}