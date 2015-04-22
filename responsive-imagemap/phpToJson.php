<?php
function issetor(&$variable, $or = NULL) {
    return $variable === NULL ? $or : $variable;
}
// get OrgId from URL
$orgId = issetor($_GET['orgid'], -1);
if ($orgId != NULL && is_string($orgId) && is_numeric($orgId)) {
    $organisationsdata = Yii::app()->getModule('wkowkis')->getOrganisationsData($orgId);
    $array = Yii::app()->getModule('wkowkis')->printKommDataMaList($organisationsdata ,null,true, false);
    print_r($array);
    $retString = "{telefon: ". $array["telefon"] .", fax: ". $array["fax"] .", email: ". $array["email"] .", url: ". $array["url"] .",}";
    echo $retString
}
?>