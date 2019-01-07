# Directories

SCRIPTS_DIR := release-scripts
DEPLOY_DIR := $(SCRIPTS_DIR)/Deployment
STAGING_DIR := $(SCRIPTS_DIR)/Staging

# Targets

STAGE_TARGETS := $(STAGING_DIR)/create_staging_branches.sh $(STAGING_DIR)/merge_master_changes.sh $(STAGING_DIR)/push_staging_branches.sh
STAGED_PR_TARGETS := $(STAGING_DIR)/create_deployment_prs.sh
DEPLOY_TARGETS := $(DEPLOY_DIR)/update_lkgs.sh $(DEPLOY_DIR)/merge_deployment_prs.sh
NOTIFY_TARGETS := $(DEPLOY_DIR)/notify_deployment_finished.sh
REVERT_TARGETS := $(SCRIPTS_DIR)/revert_to_lkgs.sh

# Built-in targets

.PHONY: staging prs deploy finished revert

# Main targets

staging: $(STAGE_TARGETS)