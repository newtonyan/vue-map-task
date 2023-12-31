<script setup lang="ts">
import {
  useVueTable,
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/vue-table";
import { MapLocation } from "../types";
import { computed } from "vue";
import { updateMap } from "../utils";

const props = defineProps<{
  data: Array<MapLocation>;
  map: google.maps.Map;
}>();

const emit = defineEmits(["delete"]);

const deleteRow = () => {
  emit(
    "delete",
    table.getSelectedRowModel().rows.map((row) => row.original.id),
    table.resetRowSelection
  );
};

const columnHelper = createColumnHelper<MapLocation>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
  }),
];

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
});

/* Computed */
const isDataEmpty = computed(() => {
  return table.getCoreRowModel().rows.length <= 0;
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold leading-10">
        Saved
        <template v-if="!isDataEmpty"
          >({{ table.getCoreRowModel().rows.length }})</template
        >
      </h2>
      <button
        class="h-8 rounded-md px-3 hover:bg-gray-200/80"
        @click="deleteRow"
        :disabled="
          !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())
        "
      >
        Delete
        <span v-if="table.getSelectedRowModel().rows.length"
          >({{ table.getSelectedRowModel().rows.length }})</span
        >
      </button>
    </div>

    <div v-if="isDataEmpty">You haven't saved any location.</div>

    <ol class="mt-2 flex flex-col gap-2">
      <li class="flex items-center gap-2">
        <label
          :for="`checkbox-select-all`"
          class="flex flex-1 items-center gap-4 rounded-md border border-gray-300 bg-teal-600 px-3 py-2 shadow-sm"
        >
          <input
            :id="`checkbox-select-all`"
            class="rounded-md text-teal-600 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-teal-500"
            type="checkbox"
            :checked="table.getIsAllPageRowsSelected()"
            :indeterminate="
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            "
            @change="() => table.toggleAllPageRowsSelected()"
          />
          <div class="text-sm font-semibold text-white">Select All</div>
        </label>
      </li>
      <li
        class="flex items-center gap-2"
        v-for="row in table.getRowModel().rows"
        :key="row.id"
      >
        <label
          :for="`checkbox-${row.original.id}`"
          class="flex flex-1 items-center gap-4 rounded-md border border-gray-300 bg-white p-3 shadow-sm hover:bg-teal-50 [&:has(input:checked)]:border-teal-500 [&:has(input:checked)]:ring-1 [&:has(input:checked)]:ring-teal-500"
          @click="
            updateMap(map, {
              center: row.original.position,
              zoom: 15,
            })
          "
        >
          <input
            :id="`checkbox-${row.original.id}`"
            class="rounded-md text-teal-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-teal-500"
            :key="row.original.id"
            type="checkbox"
            :checked="row.getIsSelected()"
            @change="
              (event) =>
                row.toggleSelected((event.target as HTMLInputElement).checked)
            "
          />
          <div class="text-sm">
            <div
              class="first:font-semibold"
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </div>
          </div>
        </label>
      </li>
    </ol>
    <div
      v-if="!isDataEmpty"
      class="mt-4 flex flex-wrap items-center justify-between gap-2"
    >
      <span class="flex items-center gap-1 text-sm font-semibold">
        <div>Page</div>
        {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </span>
      <div class="space-x-2">
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="
            () => {
              table.setPageIndex(0);
              table.resetRowSelection();
            }
          "
          :disabled="!table.getCanPreviousPage()"
        >
          «
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="
            () => {
              table.previousPage();
              table.resetRowSelection();
            }
          "
          :disabled="!table.getCanPreviousPage()"
        >
          ‹
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="
            () => {
              table.nextPage();
              table.resetRowSelection();
            }
          "
          :disabled="!table.getCanNextPage()"
        >
          ›
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="
            () => {
              table.setPageIndex(table.getPageCount() - 1);
              table.resetRowSelection();
            }
          "
          :disabled="!table.getCanNextPage()"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
