
<template>
    <h2>TEST Auto Utils</h2>
    <div></div>
</template>

<script setup lang="ts">
// import { is } from "@pks/index";
import AutoTools from "auto-tools";
import { postFrameMsg, getArrObjKVs} from "auto-tools";
// import type {  } from "auto-tools";
// console.log(AutoTools);

postFrameMsg({type: 11}, '*')
getArrObjKVs('df')
</script>

<style scoped>
</style>
