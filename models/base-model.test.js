import { QueryInterface } from "./base-model";

let queryInterface;

const tableName = "table_name";
const limit = 10;
const item = {
  uuid: "UUID",
  foo: "FOO",
  bar: "BAR",
};

beforeEach(() => {
  queryInterface = new QueryInterface(
    {
      tableName,
      client: {
        query: jest.fn(async () => ({ Items: [item], LastEvaluatedKey: "nextToken2" }))
      }
    },
    {},
    "query"
  );
});

test("should create a query and return the results", async () => {
  queryInterface.query = { uuid: "UUID", bar: "BAR" };
  const { items, nextToken } = await queryInterface
    .select(["uuid", "foo", "bar"])
    .limit(limit)
    .after("nextToken1")
    .execute();

  expect(items[0]).toBe(item);
  expect(nextToken).toBe("nextToken2");

  expect(queryInterface.model.client.query).toHaveBeenCalledWith({
    TableName: tableName,
    Limit: limit,
    KeyConditionExpression: "#uuid = :uuidValue AND #bar = :barValue",
    ExpressionAttributeNames: {
      "#uuid": "uuid",
      "#bar": "bar"
    },
    ExpressionAttributeValues: {
      ":uuidValue": "UUID",
      ":barValue": "BAR"
    },
    ExclusiveStartKey: "nextToken1",
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "uuid, foo, bar"
  });
});