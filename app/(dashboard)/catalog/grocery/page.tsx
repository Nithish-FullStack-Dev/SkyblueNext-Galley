// app/(dashboard)/catalog/grocery/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroceryStock from "./GroceryStock";
import GroceryOnboard from "./GroceryOnboard";

export default function GroceryPage() {
  return (
    <div className="p-4 sm:p-8">
      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="onboard">Onboard</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <GroceryStock />
        </TabsContent>

        <TabsContent value="onboard">
          <GroceryOnboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
