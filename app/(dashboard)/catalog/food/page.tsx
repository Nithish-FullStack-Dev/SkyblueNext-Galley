// app/catalog/food/page.tsx

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodOnboard from "./FoodOnboard";
import FoodStock from "./FoodStock";

export default function page() {
  return (
    <div className="p-4 sm:p-8">
      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="stock">Stock</TabsTrigger>

          <TabsTrigger value="onboard">Onboard</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <FoodStock />
        </TabsContent>

        <TabsContent value="onboard">
          <FoodOnboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
