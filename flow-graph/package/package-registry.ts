import { AnyBlock, BlockDefinition } from "../mod.ts";
import { Package, PackageDefinition } from "./package.ts";

const rootPackage = new Package("");

function buildPackageMap(map: Map<string, Package>, pack: Package) {
  // 
  if (pack.blocks.size != 0) {
    map.set(pack.namespace, pack);
  }

  for (const subPack of pack.packages.values()) {
    buildPackageMap(map, subPack);
  }

  return map;
}

export const registry = {
  get rootPackage() { return rootPackage },

  reset() {
    rootPackage.reset();
  },

  registerPackage(pack: PackageDefinition | Package): Package {
    if (!(pack instanceof Package)) {
      pack = new Package(pack.namespace, pack);
    }

    const [ns, packageID] = Package.extractFinalFromNamespace(pack.namespace);

    rootPackage.ensurePackage(ns).addPackage(packageID, pack);

    return pack;
  },

  hasPackage(namespace: string) {
    return rootPackage.hasPackage(namespace);
  },

  getBlockInfo<BLK extends AnyBlock = AnyBlock>(blockID: string): BlockDefinition<BLK> {
    const [ns, id] = Package.extractFinalFromNamespace(blockID);
    const pack = rootPackage.getPackage(ns);
    if (!pack)
      throw new Error(`Package not found: ${ns}`);

    const blockDefinition = pack.blocks.get(id) as BlockDefinition<BLK>;
    if (!blockDefinition)
      throw new Error(`Block ${blockID} not found`);

    return blockDefinition;
  },

  // getPackageMap(): Map<string, Package> {
  //   return buildPackageMap(new Map(), rootPackage);
  // }

  get categories(): Set<string> {
    const categories = new Set<string>();
    const packages = buildPackageMap(new Map(), rootPackage);

    packages.forEach((pack) => {
      pack.blocks.forEach((block, _id) => {
        if (block.category)
          categories.add(block.category);
      });
    });

    return categories; //Array.from(categories.values());
  },

  get blocks(): Map<string, BlockDefinition> {
    const blocks = new Map<string, BlockDefinition>();
    const packages = buildPackageMap(new Map(), rootPackage);

    packages.forEach((pack) => {
      pack.blocks.forEach((block, id) => {
        if (block.category)
          blocks.set(pack.namespace + '.' + id, block);
      });
    });

    return blocks;
  }
}


