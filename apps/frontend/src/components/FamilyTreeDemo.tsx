import { useState, useEffect } from "react";
import { familyTreeApi, personApi } from "../services/api";
import { FamilyTree, Person } from "@family-tree/shared";

export default function FamilyTreeDemo() {
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<FamilyTree | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyTrees();
  }, []);

  const loadFamilyTrees = async () => {
    try {
      setLoading(true);
      const trees = await familyTreeApi.getAll();
      setFamilyTrees(trees);
    } catch (err) {
      setError("Failed to load family trees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async (treeId: string) => {
    try {
      setLoading(true);
      const peopleData = await personApi.getAll(treeId);
      setPeople(peopleData);
    } catch (err) {
      setError("Failed to load people");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTree = async () => {
    try {
      setLoading(true);
      const newTree = await familyTreeApi.create({
        name: "My Family Tree",
        description: "A sample family tree",
        ownerName: "John Doe",
        treeType: "FAMILY_TREE" as any,
      });

      // Add a sample person
      await personApi.create({
        name: "John Doe",
        email: "john@example.com",
        position: { x: 0, y: 0 },
        treeId: newTree.id,
        isAlive: true,
      });

      await loadFamilyTrees();
      setSelectedTree(newTree);
      await loadPeople(newTree.id);
    } catch (err) {
      setError("Failed to create sample tree");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Family Tree Demo</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={createSampleTree}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Sample Tree
          </button>
          <button
            onClick={loadFamilyTrees}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Trees
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Family Trees */}
        <div>
          <h3 className="text-xl font-semibold mb-3">
            Family Trees ({familyTrees.length})
          </h3>
          <div className="space-y-2">
            {familyTrees.map((tree) => (
              <div
                key={tree.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedTree?.id === tree.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => {
                  setSelectedTree(tree);
                  loadPeople(tree.id);
                }}
              >
                <div className="font-medium">{tree.name}</div>
                <div className="text-sm text-gray-600">{tree.description}</div>
                <div className="text-xs text-gray-500">
                  Owner: {tree.ownerName || "Unknown"}
                </div>
              </div>
            ))}
            {familyTrees.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No family trees found. Create one to get started!
              </div>
            )}
          </div>
        </div>

        {/* People */}
        <div>
          <h3 className="text-xl font-semibold mb-3">
            People {selectedTree ? `in ${selectedTree.name}` : ""} (
            {people.length})
          </h3>
          <div className="space-y-2">
            {people.map((person) => (
              <div
                key={person.id}
                className="p-3 border border-gray-300 rounded"
              >
                <div className="font-medium">{person.name}</div>
                {person.email && (
                  <div className="text-sm text-gray-600">{person.email}</div>
                )}
                {person.occupation && (
                  <div className="text-xs text-gray-500">
                    {person.occupation}
                  </div>
                )}
              </div>
            ))}
            {people.length === 0 && selectedTree && (
              <div className="text-gray-500 text-center py-4">
                No people found in this tree.
              </div>
            )}
            {!selectedTree && (
              <div className="text-gray-500 text-center py-4">
                Select a family tree to view people.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
