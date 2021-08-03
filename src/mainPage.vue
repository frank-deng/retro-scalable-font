<template>
    <div>
        Main Page
        {{fontInfo}}
    </div>
</template>
<script setup>
import {inject} from 'vue';
const fontInfo=inject('fontInfo');
</script>
