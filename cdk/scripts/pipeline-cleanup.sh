#!/bin/bash
delete_stack_after_confirming() {
    if [[ -z "${1}" ]]; then
        echo "$(date) stack name missing..."
        return
    fi

    stack=$(aws cloudformation describe-stacks --stack-name "$1")
    if [[ -z "${stack}" ]]; then
        echo "$(date) stack ${1} does not exist..."
        return
    fi

    if [[ -z "${skip_flag}" ]]; then
        read -p "Delete stack with name $1 [Y/n] " -n 1 -r
    fi

    if [[ $REPLY =~ ^[n]$ ]]; then
        echo "$(date) NOT deleting stack $1."
    else
        echo "$(date) deleting stack $1..."
        aws cloudformation delete-stack --stack-name "$1"

        echo "$(date) waiting for stack delete operation to complete..."
        aws cloudformation wait stack-delete-complete --stack-name "$1"
    fi
}

skip_flag=''
while getopts 's' flag; do
  case "${flag}" in
    s) skip_flag='true' ;;
    *) error "Unexpected option ${flag}!" && exit 1 ;;
  esac
done

echo "$(date) Cleaning up resources..."
if [[ -n "${skip_flag}" ]]; then
    echo "skip_flag enabled. Script will not pause for confirmation before deleting resources!"
else
    echo "skip_flag disabled. Script will pause for confirmation before deleting resources."
fi

delete_stack_after_confirming "ContestManagerPipelineStack"

echo "$(date) cleaning up log groups..."
next_token=""
while true; do
    if [[ "${next_token}" == "" ]]; then
        response=$(aws logs describe-log-groups)
    else
        response=$(aws logs describe-log-groups --starting-token "$next_token")
    fi

    log_groups=$(echo "$response" | jq -r '.logGroups[].logGroupName | select(. | test("^/aws/codebuild/ContestManagerPipeline*"))')
    for i in $log_groups; do
        if [[ -z "${skip_flag}" ]]; then
            read -p "Delete log group with name $i [Y/n] " -n 1 -r
        fi

        if [[ $REPLY =~ ^[n]$ ]]; then
            echo "$(date) NOT deleting log group $i."
        else
            echo "$(date) deleting log group with name $i..."
            aws logs delete-log-group --log-group-name "$i"
        fi
    done

    next_token=$(echo "$response" | jq '.NextToken')
    if [[ "${next_token}" == "null" ]]; then
        # no more results left. Exit loop...
        break
    fi
done

echo "$(date) cleaning up buckets..."
for i in $(aws s3 ls | awk '{print $3}' | grep -iE "^contestmanagerpipeline.*"); do
    if [[ -z "${skip_flag}" ]]; then
        read -p "Delete bucket with name s3://${i} [Y/n] " -n 1 -r
    fi

    if [[ $REPLY =~ ^[n]$ ]]; then
        echo "$(date) NOT deleting bucket s3://${i}."
    else
        echo "$(date) emptying out s3 bucket with name s3://${i}..."
        aws s3 rm --recursive "s3://${i}"
        
        echo "$(date) deleting s3 bucket with name s3://${i}..."
        aws s3 rb "s3://${i}"
    fi
done

echo "$(date) Done cleaning up resources!"
