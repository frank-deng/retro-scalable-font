<template>
    <div class='mainPage'>
        <input v-model='state.inputText' @input='updateFont'/>
    </div>
</template>
<script setup>
import {inject, reactive} from 'vue';
const store=inject('store');
const state=reactive({
    inputText:''
});
function updateFont(){
    if(!state.inputText){
        return;
    }
    for(let char of state.inputText){
        console.log(store.fontManager.getGlyph(char));
    }
}
</script>
